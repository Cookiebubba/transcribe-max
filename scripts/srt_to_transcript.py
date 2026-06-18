#!/usr/bin/env python3
"""Convert an .srt caption file into our Markdown + JSON transcript pair.

Used to turn captions obtained out-of-band (e.g. from the Apify
`streamers/youtube-scraper` actor's `subtitles.srt` field) into the same
`transcripts/<slug>.{json,md}` layout that transcribe.py produces.

Usage:
    python scripts/srt_to_transcript.py <video_id> <path-to.srt>
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "streams.json"
OUT_DIR = ROOT / "transcripts"

TS = re.compile(r"(\d+):(\d+):(\d+)[,.](\d+)")


def ts_to_seconds(m: re.Match) -> float:
    h, mi, s, ms = (int(g) for g in m.groups())
    return h * 3600 + mi * 60 + s + ms / 1000.0


def parse_srt(text: str) -> list[dict]:
    blocks = re.split(r"\n\s*\n", text.strip())
    segments: list[dict] = []
    for block in blocks:
        lines = [ln for ln in block.splitlines() if ln.strip()]
        if not lines:
            continue
        time_line = next((ln for ln in lines if "-->" in ln), None)
        if not time_line:
            continue
        idx = lines.index(time_line)
        body = " ".join(lines[idx + 1 :]).strip()
        body = re.sub(r"<[^>]+>", "", body)  # strip styling tags
        if not body:
            continue
        start_m, end_m = TS.search(time_line.split("-->")[0]), TS.search(time_line.split("-->")[1])
        start = ts_to_seconds(start_m) if start_m else 0.0
        end = ts_to_seconds(end_m) if end_m else start
        segments.append({"start": round(start, 3), "duration": round(max(end - start, 0), 3), "text": body})
    # de-duplicate consecutive identical lines (common in rolling auto-captions)
    cleaned: list[dict] = []
    for seg in segments:
        if cleaned and seg["text"] == cleaned[-1]["text"]:
            continue
        cleaned.append(seg)
    return cleaned


def paragraphs(segments: list[dict], gap: float = 3.0) -> list[str]:
    out, cur, last_end = [], [], None
    for seg in segments:
        if last_end is not None and (seg["start"] - last_end > gap or sum(len(c) for c in cur) > 700):
            out.append(" ".join(cur))
            cur = []
        cur.append(seg["text"])
        last_end = seg["start"] + seg["duration"]
    if cur:
        out.append(" ".join(cur))
    return out


def main() -> int:
    if len(sys.argv) != 3:
        sys.exit("usage: srt_to_transcript.py <video_id> <path-to.srt>")
    video_id, srt_path = sys.argv[1], Path(sys.argv[2])
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    stream = next((s for s in manifest["streams"] if s["video_id"] == video_id), None)
    if stream is None:
        sys.exit(f"video_id {video_id} not found in streams.json")

    segments = parse_srt(srt_path.read_text(encoding="utf-8"))
    full_text = " ".join(s["text"] for s in segments)
    OUT_DIR.mkdir(exist_ok=True)
    slug = stream["slug"]

    payload = {
        "video_id": video_id,
        "title": stream["title"],
        "url": stream["url"],
        "published_at": stream["published_at"],
        "duration": stream["duration"],
        "day_number": stream.get("day_number"),
        "caption_language": "en",
        "caption_kind": "auto-generated",
        "segment_count": len(segments),
        "word_count": len(full_text.split()),
        "segments": segments,
        "full_text": full_text,
    }
    (OUT_DIR / f"{slug}.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    lines = [
        f"# {stream['title']}",
        "",
        f"- **Video:** {stream['url']}",
        f"- **Published:** {stream['published_at']}",
        f"- **Duration:** {stream['duration']}",
        f"- **Captions:** auto-generated (en)",
        f"- **Words:** {len(full_text.split()):,}",
        "",
        "---",
        "",
    ]
    for para in paragraphs(segments):
        lines.append(para)
        lines.append("")
    (OUT_DIR / f"{slug}.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    print(f"Wrote transcripts/{slug}.json and transcripts/{slug}.md ({len(segments)} segments, {len(full_text.split()):,} words).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
