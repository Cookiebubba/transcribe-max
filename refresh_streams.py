#!/usr/bin/env python3
"""Refresh streams.json by re-enumerating MaxBladeTv's Live tab via Apify.

The channel's ended live-stream VODs are NOT listed on the normal /videos tab
and the series playlist is not publicly enumerable by scrapers, so we read the
channel's /streams page with the battle-tested `streamers/youtube-scraper`
Apify actor. (Direct YouTube scraping from a datacenter IP is usually blocked;
Apify runs the crawl on residential proxies.)

This calls the Apify REST API directly, so it must run somewhere that can reach
https://api.apify.com (i.e. NOT inside the restricted build sandbox).

Setup:
    export APIFY_TOKEN=apify_api_xxx        # already set in this project's env
    pip install -r requirements.txt          # installs requests

Usage:
    python refresh_streams.py                # rewrite streams.json from the live channel
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "streams.json"
ACTOR = "streamers~youtube-scraper"
CHANNEL_STREAMS_URL = "https://www.youtube.com/@MaxBladeTv/streams"
API = "https://api.apify.com/v2"


def duration_to_seconds(hms: str) -> int:
    parts = [int(p) for p in (hms or "0").split(":")]
    while len(parts) < 3:
        parts.insert(0, 0)
    h, m, s = parts
    return h * 3600 + m * 60 + s


def day_number(title: str) -> int | None:
    m = re.search(r"\bday\s*([0-9]+)\b", title or "", re.IGNORECASE)
    return int(m.group(1)) if m else None


def slug(video_id: str, title: str) -> str:
    day = day_number(title)
    base = f"day-{day:02d}" if day is not None else "stream"
    return f"{base}-{video_id}"


def run_actor(token: str) -> list[dict]:
    payload = {
        "startUrls": [{"url": CHANNEL_STREAMS_URL}],
        "maxResults": 0,
        "maxResultStreams": 1000,
        "maxResultsShorts": 0,
        "downloadSubtitles": False,
        "sortVideosBy": "OLDEST",
    }
    print(f"Starting actor {ACTOR} on {CHANNEL_STREAMS_URL} ...")
    r = requests.post(
        f"{API}/acts/{ACTOR}/runs",
        params={"token": token},
        json=payload,
        timeout=60,
    )
    r.raise_for_status()
    run = r.json()["data"]
    run_id = run["id"]
    dataset_id = run["defaultDatasetId"]

    while True:
        time.sleep(5)
        st = requests.get(f"{API}/actor-runs/{run_id}", params={"token": token}, timeout=60)
        st.raise_for_status()
        status = st.json()["data"]["status"]
        print(f"  run status: {status}")
        if status in {"SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"}:
            if status != "SUCCEEDED":
                sys.exit(f"Actor run ended with status {status}")
            break

    items = requests.get(
        f"{API}/datasets/{dataset_id}/items",
        params={"token": token, "clean": "true", "format": "json"},
        timeout=120,
    )
    items.raise_for_status()
    return items.json()


def main() -> int:
    token = os.environ.get("APIFY_TOKEN")
    if not token:
        sys.exit("APIFY_TOKEN is not set. export APIFY_TOKEN=apify_api_xxx")

    raw = run_actor(token)
    rows = []
    seen = set()
    for it in raw:
        vid = it.get("id")
        if not vid or vid in seen or it.get("error"):
            continue
        seen.add(vid)
        title = it.get("title") or ""
        dur = it.get("duration") or "00:00:00"
        rows.append(
            {
                "video_id": vid,
                "title": title,
                "url": it.get("url") or f"https://www.youtube.com/watch?v={vid}",
                "published_at": it.get("date") or "",
                "duration": dur,
                "duration_seconds": duration_to_seconds(dur),
                "day_number": day_number(title),
                "slug": slug(vid, title),
            }
        )
    rows.sort(key=lambda r: r["published_at"])

    out = {
        "channel": "MaxBladeTv",
        "channel_handle": "@MaxBladeTv",
        "channel_url": "https://www.youtube.com/@MaxBladeTv",
        "channel_id": "UChcJv_JCjQHXcgjlHpxDIcA",
        "source": "channel /streams tab (ended live broadcasts)",
        "snapshot_date": time.strftime("%Y-%m-%d"),
        "stream_count": len(rows),
        "streams": rows,
    }
    MANIFEST.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    total = sum(r["duration_seconds"] for r in rows)
    print(f"Wrote {MANIFEST} with {len(rows)} streams ({total/3600:.1f} total hours).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
