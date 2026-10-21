#!/usr/bin/env python3
"""Ingest YouTube live-chat replay for MaxBladeTv streams into hivecoding.

Uses the Apify actor `coregent/youtube-live-chat-scraper` in *replay* mode,
which is the only reliable way to get the chat of an ENDED stream — the official
YouTube Data API cannot do this at all (liveChatMessages works only while a
broadcast is live).

Billing is per chat event ($0.001 each at BRONZE), so every run takes an
explicit ceiling. See hivecoding/README.md for the cost model.

Setup:
    export APIFY_TOKEN=apify_api_xxx
    pip install requests

Examples:
    python hivecoding/ingest/fetch_chat.py --latest 1 --max-total 2000
    python hivecoding/ingest/fetch_chat.py --video al0kXm7r3Kk --max-total 0
    python hivecoding/ingest/fetch_chat.py --latest 5 --dry-run
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

import requests

API = "https://api.apify.com/v2"
ACTOR = "coregent~youtube-live-chat-scraper"
CHANNEL = "@MaxBladeTv"
OUT = Path(__file__).resolve().parent.parent / "data"

# Avatars come back from YouTube at 32px, far too small for a card face.
# googleusercontent/ggpht URLs take a size parameter, so ask for a big one.
AVATAR_SIZE = 512


def normalize_avatar(url: str | None, size: int = AVATAR_SIZE) -> str | None:
    """Rewrite `=s32-c-k-...` to `=s512-c-k-...` for a print-quality face."""
    if not url:
        return None
    return re.sub(r"=s\d+-", f"=s{size}-", url)


def run_actor(token: str, payload: dict, poll: float = 5.0) -> str:
    r = requests.post(f"{API}/acts/{ACTOR}/runs", params={"token": token},
                      json=payload, timeout=60)
    r.raise_for_status()
    run = r.json()["data"]
    run_id, dataset_id = run["id"], run["defaultDatasetId"]
    print(f"run {run_id} started")
    while True:
        time.sleep(poll)
        st = requests.get(f"{API}/actor-runs/{run_id}", params={"token": token},
                          timeout=60).json()["data"]
        print(f"  status: {st['status']}")
        if st["status"] in {"SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"}:
            if st["status"] != "SUCCEEDED":
                sys.exit(f"actor run ended {st['status']}")
            return dataset_id


def fetch_items(token: str, dataset_id: str, page: int = 1000) -> list[dict]:
    items, offset = [], 0
    while True:
        r = requests.get(f"{API}/datasets/{dataset_id}/items",
                         params={"token": token, "clean": "true", "format": "json",
                                 "limit": page, "offset": offset}, timeout=120)
        r.raise_for_status()
        batch = r.json()
        if not batch:
            break
        items.extend(batch)
        offset += len(batch)
        print(f"  fetched {offset} events")
        if len(batch) < page:
            break
    return items


def rows_from_events(events: list[dict]) -> tuple[list[dict], list[dict]]:
    """Split raw actor output into chatter rows and chat_event rows."""
    chatters: dict[str, dict] = {}
    chat_events = []
    for e in events:
        cid = e.get("authorChannelId")
        name = e.get("authorName") or ""
        if cid:
            c = chatters.setdefault(cid, {
                "channel_id": cid,
                "handle": e.get("authorHandle") or name,
                "display_name": name,
                "avatar_url": normalize_avatar(e.get("authorPhotoUrl")),
                "is_bot": bool(re.search(r"\b(nightbot|streamlabs|streamelements)\b",
                                         name, re.I)),
                "first_seen_at": e.get("publishedAt"),
                "last_seen_at": e.get("publishedAt"),
            })
            # keep the widest seen window
            if e.get("publishedAt"):
                c["last_seen_at"] = max(c["last_seen_at"] or "", e["publishedAt"])
        chat_events.append({
            "message_id": e.get("messageId"),
            "video_id": e.get("videoId"),
            "channel_id": cid,
            "event_type": e.get("eventType"),
            "posted_at": e.get("publishedAt"),
            "video_offset_ms": e.get("videoOffsetMsec"),
            "message_text": e.get("messageText"),
            "superchat_value": e.get("superChatAmountValue"),
            "superchat_currency": e.get("superChatCurrency"),
            "is_member": bool(e.get("isMember")),
            "is_moderator": bool(e.get("isModerator")),
            "is_owner": bool(e.get("isOwner")),
            "is_verified": bool(e.get("isVerified")),
            "badges": e.get("authorBadges") or [],
        })
    return list(chatters.values()), chat_events


def main() -> int:
    ap = argparse.ArgumentParser(description="Ingest YouTube chat replay.")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--video", action="append", help="Video id/URL (repeatable).")
    g.add_argument("--latest", type=int, help="N most recent replays from the channel.")
    ap.add_argument("--max-total", type=int, default=5000,
                    help="Hard ceiling on chat events for the whole run (0 = unlimited). "
                         "This is the spend control: events x $0.001.")
    ap.add_argument("--max-per-video", type=int, default=0,
                    help="Per-video cap (0 = whole chat).")
    ap.add_argument("--lookback-days", type=int, default=0, help="0 = no age limit.")
    ap.add_argument("--superchats-only", action="store_true",
                    help="Skip normal messages — cheap monetization-only pass.")
    ap.add_argument("--dry-run", action="store_true", help="Print the payload and exit.")
    args = ap.parse_args()

    payload: dict = {
        "mode": "replay",
        "includeNormalMessages": not args.superchats_only,
        "includeSuperChats": True,
        "includeMembershipEvents": True,
        "includeModerationEvents": False,
        "maxMessagesPerVideo": args.max_per_video,
        "maxTotalItems": args.max_total,
        "language": "en",
        "regionCode": "US",
    }
    if args.video:
        payload["videoRefs"] = args.video
    else:
        payload.update({
            "channelRefs": [CHANNEL],
            "channelDiscoveryMode": "latest_replays_only",
            "maxVideosPerChannel": args.latest,
            "lookbackDays": args.lookback_days,
        })

    if args.dry_run:
        print(json.dumps(payload, indent=2))
        est = args.max_total * 0.001 if args.max_total else float("nan")
        print(f"\nceiling implies at most ~${est:.2f} in chat-event charges")
        return 0

    token = os.environ.get("APIFY_TOKEN")
    if not token:
        sys.exit("APIFY_TOKEN is not set")

    dataset_id = run_actor(token, payload)
    events = fetch_items(token, dataset_id)
    chatters, chat_events = rows_from_events(events)

    OUT.mkdir(exist_ok=True)
    by_video: dict[str, int] = {}
    for e in chat_events:
        by_video[e["video_id"]] = by_video.get(e["video_id"], 0) + 1

    (OUT / "chatters.json").write_text(
        json.dumps(chatters, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (OUT / "chat_events.json").write_text(
        json.dumps(chat_events, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"\n{len(events)} events | {len(chatters)} chatters | "
          f"{len(by_video)} stream(s)")
    for v, n in by_video.items():
        print(f"  {v}: {n} events")
    print(f"charged ~${len(events) * 0.001:.2f} in chat events")
    print(f"wrote {OUT}/chatters.json and {OUT}/chat_events.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
