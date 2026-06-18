#!/usr/bin/env python3
"""Transcribe every MaxBladeTv stream from its YouTube captions.

Reads `streams.json` (the manifest of the channel's live-stream VODs) and, for
each stream, downloads the English captions with yt-dlp and writes two files
into `transcripts/`:

  * `<slug>.json` — structured: metadata + timestamped segments + full text
  * `<slug>.md`   — human-readable Markdown (header + metadata + transcript)

This uses YouTube's existing captions only (auto-generated or uploaded). It does
NOT do audio/Whisper transcription, so streams without captions are reported and
skipped rather than transcribed.

Requirements:
    pip install -r requirements.txt        # installs yt-dlp
    # yt-dlp must be able to reach youtube.com (run it somewhere not IP-blocked)

Usage:
    python transcribe.py                    # transcribe all not-yet-done streams
    python transcribe.py --force            # re-fetch even if output exists
    python transcribe.py --only day-46-iSy9MB15csw   # one slug (or video id)
    python transcribe.py --lang en          # caption language (default: en)
    python transcribe.py --list             # just list the manifest

Exit code is non-zero if any stream failed to produce a transcript.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "streams.json"
OUT_DIR = ROOT / "transcripts"


def load_manifest() -> dict:
    if not MANIFEST.exists():
        sys.exit(f"Manifest not found: {MANIFEST}\nRun scripts/build_manifest.py or refresh_streams.py first.")
    return json.loads(MANIFEST.read_text(encoding="utf-8"))


def have_ytdlp() -> bool:
    try:
        subprocess.run(["yt-dlp", "--version"], capture_output=True, check=True)
        return True
    except (OSError, subprocess.CalledProcessError):
        return False


def fetch_caption_file(url: str, lang: str, tmp: Path) -> Path | None:
    """Download captions for a video as json3; return the file path or None."""
    out_tmpl = str(tmp / "%(id)s.%(ext)s")
    cmd = [
        "yt-dlp",
        "--skip-download",
        "--write-subs",
        "--write-auto-subs",
        "--sub-langs", f"{lang}.*,{lang}",
        "--sub-format", "json3",
        "-o", out_tmpl,
        url,
    ]
    subprocess.run(cmd, capture_output=True, text=True)
    candidates = sorted(tmp.glob("*.json3"))
    return candidates[0] if candidates else None


def parse_json3(path: Path) -> list[dict]:
    """Parse a yt-dlp json3 subtitle file into [{start, duration, text}]."""
    data = json.loads(path.read_text(encoding="utf-8"))
    segments: list[dict] = []
    for ev in data.get("events", []):
        segs = ev.get("segs")
        if not segs:
            continue
        text = "".join(s.get("utf8", "") for s in segs).strip()
        if not text:
            continue
        start = ev.get("tStartMs", 0) / 1000.0
        dur = ev.get("dDurationMs", 0) / 1000.0
        segments.append({"start": round(start, 3), "duration": round(dur, 3), "text": text})
    return segments


def hhmmss(seconds: float) -> str:
    s = int(seconds)
    return f"{s // 3600:02d}:{(s % 3600) // 60:02d}:{s % 60:02d}"


def segments_to_paragraphs(segments: list[dict], gap: float = 3.0) -> list[str]:
    """Group caption segments into readable paragraphs on pauses / length."""
    paragraphs: list[str] = []
    current: list[str] = []
    last_end = None
    for seg in segments:
        if last_end is not None and (seg["start"] - last_end > gap or sum(len(c) for c in current) > 700):
            paragraphs.append(" ".join(current))
            current = []
        current.append(seg["text"])
        last_end = seg["start"] + seg["duration"]
    if current:
        paragraphs.append(" ".join(current))
    return paragraphs


def write_outputs(stream: dict, segments: list[dict], auto: bool, lang: str) -> None:
    OUT_DIR.mkdir(exist_ok=True)
    slug = stream["slug"]
    full_text = " ".join(s["text"] for s in segments)

    payload = {
        "video_id": stream["video_id"],
        "title": stream["title"],
        "url": stream["url"],
        "published_at": stream["published_at"],
        "duration": stream["duration"],
        "day_number": stream.get("day_number"),
        "caption_language": lang,
        "caption_kind": "auto-generated" if auto else "uploaded",
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
        f"- **Captions:** {'auto-generated' if auto else 'uploaded'} ({lang})",
        f"- **Words:** {len(full_text.split()):,}",
        "",
        "---",
        "",
    ]
    for para in segments_to_paragraphs(segments):
        lines.append(para)
        lines.append("")
    (OUT_DIR / f"{slug}.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description="Transcribe MaxBladeTv streams from YouTube captions.")
    ap.add_argument("--force", action="store_true", help="Re-fetch even if output already exists.")
    ap.add_argument("--only", help="Transcribe a single stream by slug or video id.")
    ap.add_argument("--lang", default="en", help="Caption language code (default: en).")
    ap.add_argument("--list", action="store_true", help="List the manifest and exit.")
    args = ap.parse_args()

    manifest = load_manifest()
    streams = manifest["streams"]

    if args.list:
        for s in streams:
            print(f"{s['slug']:>28}  {s['duration']:>9}  {s['title']}")
        print(f"\n{len(streams)} streams.")
        return 0

    if args.only:
        streams = [s for s in streams if args.only in (s["slug"], s["video_id"])]
        if not streams:
            sys.exit(f"No stream matches --only {args.only!r}")

    if not have_ytdlp():
        sys.exit("yt-dlp not found. Install with: pip install -r requirements.txt")

    OUT_DIR.mkdir(exist_ok=True)
    done = skipped = failed = 0
    for i, stream in enumerate(streams, 1):
        slug = stream["slug"]
        target = OUT_DIR / f"{slug}.json"
        prefix = f"[{i}/{len(streams)}] {slug}"
        if target.exists() and not args.force:
            print(f"{prefix}: already done, skipping")
            skipped += 1
            continue
        print(f"{prefix}: fetching captions...", flush=True)
        with tempfile.TemporaryDirectory() as td:
            cap = fetch_caption_file(stream["url"], args.lang, Path(td))
            if cap is None:
                print(f"{prefix}: NO CAPTIONS available — skipped")
                failed += 1
                continue
            auto = ".auto." in cap.name or f"{args.lang}-orig" not in cap.name and "auto" in cap.name.lower()
            segments = parse_json3(cap)
            if not segments:
                print(f"{prefix}: captions empty — skipped")
                failed += 1
                continue
            write_outputs(stream, segments, auto=auto, lang=args.lang)
            print(f"{prefix}: wrote {len(segments)} segments")
            done += 1

    print(f"\nDone. transcribed={done} skipped={skipped} failed/no-captions={failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
