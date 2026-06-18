#!/usr/bin/env python3
"""Build transcripts from spilled Apify dataset results (build-sandbox path).

When the Apify MCP `get-dataset-items` result is too large to inline, the
harness writes it to a file on disk. This script reads those spilled JSON files,
finds every item that has both a video id and SRT captions, and converts them
into transcripts/<slug>.{json,md} using the manifest in streams.json.

This is a build-time helper for producing the bundled transcripts inside the
restricted sandbox. End users normally just run `transcribe.py` instead.

Usage:
    python scripts/process_spill.py [glob ...]
    # default glob: the harness tool-results directory
"""
from __future__ import annotations

import glob
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from srt_to_transcript import parse_srt, paragraphs  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "transcripts"
DEFAULT_GLOB = "/root/.claude/projects/-home-user-transcribe-max/*/tool-results/*.txt"


def load_manifest_by_id() -> dict[str, dict]:
    data = json.loads((ROOT / "streams.json").read_text(encoding="utf-8"))
    return {s["video_id"]: s for s in data["streams"]}


def first_srt(subtitles) -> tuple[str, str] | None:
    """Return (srt_text, kind) from a subtitles value, or None."""
    if not subtitles:
        return None
    entries = subtitles if isinstance(subtitles, list) else [subtitles]
    # prefer an English entry that actually has srt text
    for e in entries:
        if isinstance(e, dict) and e.get("srt"):
            kind = "auto-generated" if "auto" in str(e.get("type", "")).lower() else "uploaded"
            return e["srt"], kind
    return None


def write_transcript(stream: dict, srt_text: str, kind: str) -> int:
    segments = parse_srt(srt_text)
    if not segments:
        return 0
    full_text = " ".join(s["text"] for s in segments)
    OUT_DIR.mkdir(exist_ok=True)
    slug = stream["slug"]
    payload = {
        "video_id": stream["video_id"],
        "title": stream["title"],
        "url": stream["url"],
        "published_at": stream["published_at"],
        "duration": stream["duration"],
        "day_number": stream.get("day_number"),
        "caption_language": "en",
        "caption_kind": kind,
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
        f"- **Captions:** {kind} (en)",
        f"- **Words:** {len(full_text.split()):,}",
        "",
        "---",
        "",
    ]
    for para in paragraphs(segments):
        lines.append(para)
        lines.append("")
    (OUT_DIR / f"{slug}.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    return len(segments)


def main() -> int:
    patterns = sys.argv[1:] or [DEFAULT_GLOB]
    by_id = load_manifest_by_id()
    files: list[str] = []
    for pat in patterns:
        files.extend(glob.glob(pat))
    print(f"Scanning {len(files)} spilled result file(s)...")

    processed: set[str] = set()
    for fp in files:
        try:
            data = json.loads(Path(fp).read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        items = data.get("items") if isinstance(data, dict) else None
        if not items:
            continue
        for it in items:
            if not isinstance(it, dict):
                continue
            vid = it.get("id")
            if not vid or vid in processed or vid not in by_id:
                continue
            srt = first_srt(it.get("subtitles"))
            if not srt:
                continue
            n = write_transcript(by_id[vid], srt[0], srt[1])
            if n:
                processed.add(vid)
                print(f"  {by_id[vid]['slug']}: {n} segments")

    missing = [s["slug"] for vid, s in by_id.items() if vid not in processed
               and not (OUT_DIR / f"{s['slug']}.json").exists()]
    print(f"\nTranscribed {len(processed)} stream(s).")
    if missing:
        print(f"Still missing {len(missing)}:")
        for m in missing:
            print(f"  - {m}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
