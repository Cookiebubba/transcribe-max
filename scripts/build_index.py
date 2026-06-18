#!/usr/bin/env python3
"""Generate transcripts/INDEX.md from streams.json + the transcripts/ folder."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "transcripts"


def main() -> int:
    manifest = json.loads((ROOT / "streams.json").read_text(encoding="utf-8"))
    streams = sorted(manifest["streams"], key=lambda s: s["published_at"])

    done, words = 0, 0
    table = []
    for s in streams:
        slug = s["slug"]
        jpath = OUT_DIR / f"{slug}.json"
        if jpath.exists():
            wc = json.loads(jpath.read_text(encoding="utf-8"))["word_count"]
            words += wc
            done += 1
            link = f"[md](./{slug}.md) · [json](./{slug}.json)"
            wcs = f"{wc:,}"
        else:
            link = "_none_"
            wcs = "—"
        day = f"Day {s['day_number']}" if s.get("day_number") is not None else "stream"
        title = s["title"].replace("|", "\\|")
        table.append(
            f"| {day} | {s['published_at'][:10]} | {s['duration']} | {wcs} | {link} | "
            f"[▶]({s['url']}) | {title} |"
        )

    lines = [
        "# MaxBladeTv stream transcripts — index",
        "",
        f"Channel: [{manifest['channel_handle']}]({manifest['channel_url']})  ",
        f"Streams: **{len(streams)}** · Transcribed: **{done}** · "
        f"No captions: **{len(streams) - done}** · Words: **{words:,}**  ",
        f"Snapshot: {manifest['snapshot_date']}",
        "",
        "| # | Date | Duration | Words | Transcript | Video | Title |",
        "|---|------|----------|-------|------------|-------|-------|",
        *table,
    ]
    (OUT_DIR / "INDEX.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    print(f"Wrote {OUT_DIR/'INDEX.md'} ({done}/{len(streams)} transcribed, {words:,} words).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
