#!/usr/bin/env python3
"""Generate streams.json from the scraped snapshot of MaxBladeTv's Live tab.

This is a one-off seed builder: the raw rows below were captured from the
channel's /streams page (via the Apify `streamers/youtube-scraper` actor) on
2026-06-23. Re-running `refresh_streams.py` will overwrite streams.json with a
fresh enumeration; this script just bakes in the known-good snapshot so the
repo has a complete manifest without needing network access.

Usage:
    python scripts/build_manifest.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

# (video_id, title, published_at_iso, duration_hh_mm_ss)
RAW: list[tuple[str, str, str, str]] = [
    ("fzQ73Q5oGa0", "Test Stream :) PLS IGNORE", "2024-12-28T02:16:54Z", "00:00:49"),
    ("UaTJ0-oHBPk", "Building a Glowing Ai GitHub Commit Button", "2024-12-29T00:31:51Z", "01:49:06"),
    ("38Uiw_Fin-w", "Building a Glowing Ai GitHub Commit Button", "2024-12-30T00:16:22Z", "01:34:07"),
    ("cr3mvgGQvKY", "Building a Glowing Ai GitHub Commit Button", "2024-12-30T10:40:09Z", "00:01:38"),
    ("B-lkgRFmxQ0", "Building a Glowing Ai GitHub Commit Button", "2024-12-31T00:03:21Z", "00:54:39"),
    ("ngsiNEHbIr0", "Building a Glowing Ai GitHub Commit Button", "2025-01-01T00:03:33Z", "01:21:10"),
    ("ULwVjtVKXFY", "Building a Glowing Ai GitHub Commit Button, HAPPY NEW YEAR!!", "2025-01-02T00:17:46Z", "00:53:48"),
    ("aRzkugQ_L_0", "Building a Glowing Ai GitHub Commit Button, HAPPY NEW YEAR!!", "2025-01-02T23:28:30Z", "00:44:48"),
    ("ktFXbvywgHc", "Building a Glowing Ai GitHub Commit Button, HAPPY NEW YEAR!!", "2025-01-03T00:04:01Z", "00:30:55"),
    ("Vp_I7NZ3ffM", "Building a Glowing Ai GitHub Commit Button, HAPPY NEW YEAR!!", "2025-01-03T23:52:53Z", "00:56:26"),
    ("M5fSgyNWBRA", "MONDAY BUTTON BUILDING ( This week were done for real )", "2025-01-06T23:52:45Z", "00:53:47"),
    ("ULT3DtNDeAo", "Vibe Coding a $100M AAA video game ( day 1 ) #vibejam", "2026-04-09T16:55:20Z", "02:09:29"),
    ("8KmygLIX6Cw", "Vibe Coding a AAA game #VibeJam (Day 2)", "2026-04-11T10:28:21Z", "01:52:56"),
    ("LzfHNGARh80", "Vibe Coding a AAA game #VibeJam (Day 2)", "2026-04-14T02:49:26Z", "01:17:01"),
    ("FI5Bky1XKPU", "Day 1 – Vibe Coding Until I Buy My Family a House ( $32,160 ARR )", "2026-04-16T06:03:21Z", "02:58:13"),
    ("-lFV-lgOnpY", "Day 2 – Vibe Coding Until I Buy My Family a House ( $31,524 ARR )", "2026-04-17T05:36:37Z", "03:01:39"),
    ("zS4OdLPfhZY", "Day 3 – Vibe Coding Until I Buy My Family a House ( $31,524 ARR )", "2026-04-17T18:06:37Z", "04:02:58"),
    ("K6Kyr0n7TvQ", "Day 4 – Vibe Coding Until I Buy My Family a House ( $29,208 ARR )", "2026-04-21T10:36:44Z", "03:20:28"),
    ("iOtmC2LlYac", "Day 5 – Vibe Coding Until I Buy My Family a House ( $28,332 ARR )", "2026-04-22T03:37:56Z", "01:12:40"),
    ("BAhglss2e-o", "Day 6 – Vibe Coding Until I Buy My Family a House ( $28,332 ARR )", "2026-04-23T08:05:27Z", "03:42:03"),
    ("ddyTp95pf24", "Day 7 – Vibe Coding Until I Buy My Family a House ( $28,824 ARR )", "2026-04-24T05:44:54Z", "02:02:38"),
    ("sQ-0Pk6_asI", "Day 8 – Vibe Coding Until I Buy My Family a House ( $28,824 ARR )", "2026-04-24T19:32:38Z", "05:11:26"),
    ("oWlz7hXSvRE", "Day 9 – Vibe Coding Until I Buy My Family a House ( $30,024 ARR )", "2026-04-27T18:43:35Z", "04:27:16"),
    ("hzCWy303ak0", "Day 10 – Vibe Coding Until I Buy My Family a House ( $30,444 ARR )", "2026-04-29T04:07:27Z", "01:22:23"),
    ("uWcnJ39FNrI", "Day 10 – Vibe Coding Until I Buy My Family a House ( $30,444 ARR )", "2026-04-29T07:49:49Z", "02:57:28"),
    ("GxIKVrImvKA", "Day 11 – Vibe Coding Until I Buy My Family a House ( $29,964 ARR )", "2026-04-30T05:21:03Z", "02:39:34"),
    ("kV5eXIXhMHQ", "Day 12 – Vibe Coding Until I Buy My Family a House ( $30,276 ARR )", "2026-04-30T19:55:09Z", "05:09:41"),
    ("gL0dzeF4xZY", "Day 13 – Vibe Coding Until I Buy My Family a House ( $30,276 ARR )", "2026-05-01T19:52:00Z", "05:08:23"),
    ("keo0g_AIe3I", "Day 14 – Vibe Coding Until I Buy My Family a House ( $29,712 ARR )", "2026-05-05T08:17:08Z", "03:58:12"),
    ("UvXbQw365r0", "Day 15 – Vibe Coding Until I Buy My Family a House ( $29,811 ARR )", "2026-05-05T18:37:30Z", "04:08:07"),
    ("sqHei0bl1Ng", "Day 16 – Vibe Coding Until I Buy My Family a House ( $28,800 ARR )", "2026-05-06T16:37:02Z", "02:08:17"),
    ("BSe-OvDjr3g", "Day 17 – Vibe Coding Until I Buy My Family a House ( $28,896 ARR )", "2026-05-07T19:27:33Z", "05:02:39"),
    ("4tXlEqQbEZo", "Day 18 – GIVEAWAY + Vibe Coding Until I Buy My Family a House ( $28,668 ARR )", "2026-05-08T19:09:40Z", "04:21:21"),
    ("nk9bUv2YCUc", "Day 19 – Vibe Coding Until I Buy My Family a House ( $27,576 ARR )", "2026-05-11T17:21:14Z", "02:58:12"),
    ("ZC9NR03y8MA", "Day 20 – Vibe Coding Until I Buy My Family a House ( $27,576 ARR )", "2026-05-12T19:14:41Z", "04:26:29"),
    ("K_9Emt_5Tvs", "Day 21 – Vibe Coding Until I Buy My Family a House ( $27,576 ARR )", "2026-05-13T17:58:54Z", "03:23:27"),
    ("r78x36FcIWQ", "Day 21 – Vibe Coding Until I Buy My Family a House ( $27,576 ARR )", "2026-05-13T19:12:28Z", "01:17:25"),
    ("KWTUMLvj3ts", "Day 22 – Vibe Coding Until I Buy My Family a House ( $27,576 ARR )", "2026-05-14T18:38:58Z", "03:41:10"),
    ("Lw7MFi0eCgI", "Day 23 – Vibe Coding Until I Buy My Family a House ( $26,328 ARR )", "2026-05-15T17:56:56Z", "03:33:33"),
    ("rYD15QH72KQ", "Day 24 – Vibe Coding Until I Buy My Family a House ( $24,048 ARR )", "2026-05-18T15:56:03Z", "01:23:38"),
    ("tFh5BuwN2ok", "Day 24 – Vibe Coding Until I Buy My Family a House ( $24,048 ARR )", "2026-05-18T21:46:06Z", "04:02:56"),
    ("HqgVrZNJXZQ", "Day 25 – Vibe Coding Until I Buy My Family a House ( $24,816 ARR )", "2026-05-19T18:31:42Z", "03:19:03"),
    ("X2RPbuBFPRo", "Day 26 – Vibe Coding Until I Buy My Family a House ( $24,744 ARR )", "2026-05-20T17:01:59Z", "02:20:15"),
    ("OYG7irO8iBk", "Day 27 – Vibe Coding Until I Buy My Family a House ( $22,872 ARR )", "2026-05-21T18:22:26Z", "03:40:49"),
    ("JFaCkPB67Lw", "Day 28 – Vibe Coding Until I Buy My Family a House ( $22,872 ARR )", "2026-05-22T18:36:39Z", "03:54:54"),
    ("I6mQVamLxAo", "Day 29 – Vibe Coding Until I Buy My Family a House ( $22,872 ARR )", "2026-05-26T07:08:31Z", "03:28:01"),
    ("0dP6nB9CcbE", "Day 30 – Vibe Coding Until I Buy My Family a House ( $22,296 ARR )", "2026-05-27T07:26:27Z", "03:15:48"),
    ("RH_4Sjarolg", "Day 31 – Vibe Coding Until I Buy My Family a House ( $22,296 ARR )", "2026-05-27T17:58:29Z", "03:21:10"),
    ("jIfBY5yd7P4", "TESTING OPUS 4.8 ULTRACODE", "2026-05-28T18:14:04Z", "03:37:15"),
    ("Oam7uaiwYyU", "Day 33 – Vibe Coding Until I Buy My Family a House ( $21,672 ARR )", "2026-05-29T16:50:22Z", "02:14:26"),
    ("Vgm0YCo1rd8", "Day 34 – Vibe Coding Until I Buy My Family a House ( $21,672 ARR )", "2026-06-01T21:53:09Z", "07:30:38"),
    ("bKVWcS8RsCU", "Day 35 – Vibe Coding Until I Buy My Family a House ( $21,672 ARR )", "2026-06-02T16:41:35Z", "02:30:34"),
    ("zW2tloD2mx0", "Day 38 – Vibe Coding Until I Buy My Family a House ( $21,636 ARR )", "2026-06-05T17:55:49Z", "03:17:57"),
    ("kt4xJdrYtp4", "Day 39 – Vibe Coding Until I Buy My Family a House ( $21,636 ARR )", "2026-06-08T17:18:22Z", "02:43:26"),
    ("Ea-CQ1PWxA8", "Day 39 – Vibe Coding Until I Buy My Family a House ( $21,636 ARR )", "2026-06-09T08:36:57Z", "02:53:31"),
    ("idiuL75QXfQ", "TESTING CLAUDE MYTHOS ALL DAY!", "2026-06-09T22:56:33Z", "07:59:41"),
    ("igKjMaUHaUU", "DAY 41 - Vibe coding until I buy my family a house ( $20,154 ARR )", "2026-06-10T18:25:43Z", "03:37:38"),
    ("e-uQEe_HRWo", "DAY 42 - Vibe coding until I buy my family a house ( $20,154 ARR )", "2026-06-11T20:06:57Z", "05:22:26"),
    ("Ris3XOQ3f8Y", "Not leaving my desk until I vibe code an entire windows app", "2026-06-12T20:06:13Z", "05:04:52"),
    ("E07ps2b843Y", "Day 43 - VIBE CODING UNTIL I BUY MY FAMILY A HOUSE", "2026-06-16T06:37:38Z", "02:33:16"),
    ("MzNA0EMUva0", "Day 45 - Vibe coding until I buy my family a house ( Earned : $9,319 )", "2026-06-17T18:49:14Z", "04:13:36"),
    ("iSy9MB15csw", "Day 46 - Vibe coding until I buy my family a house ( Earned : $9,826 )", "2026-06-18T14:17:34Z", "03:59:38"),
    ("XmvJUs-FdK0", "Day 47 - Vibe coding until I buy my family a house ( Earned : $13,075 )", "2026-06-20T11:38:43Z", "03:14:14"),
    ("HSJuooZ_z5g", "Day 48 - Vibe coding until I buy my family a house ( Earned : $19,348 )", "2026-06-23T06:46:37Z", "03:39:02"),
    ("O57Y3lg0rCc", "Day 49 - Vibe coding until I buy my family a house ( Earned : $20,686 )", "2026-06-23T14:27:28Z", "00:00:00"),
]


def duration_to_seconds(hms: str) -> int:
    parts = [int(p) for p in hms.split(":")]
    while len(parts) < 3:
        parts.insert(0, 0)
    h, m, s = parts
    return h * 3600 + m * 60 + s


def day_number(title: str) -> int | None:
    m = re.search(r"\bday\s*([0-9]+)\b", title, re.IGNORECASE)
    return int(m.group(1)) if m else None


def slug(video_id: str, title: str) -> str:
    day = day_number(title)
    base = f"day-{day:02d}" if day is not None else "stream"
    return f"{base}-{video_id}"


def main() -> None:
    rows = []
    for vid, title, date, dur in RAW:
        rows.append(
            {
                "video_id": vid,
                "title": title,
                "url": f"https://www.youtube.com/watch?v={vid}",
                "published_at": date,
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
        "snapshot_date": "2026-06-23",
        "stream_count": len(rows),
        "streams": rows,
    }
    dest = Path(__file__).resolve().parent.parent / "streams.json"
    dest.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    total = sum(r["duration_seconds"] for r in rows)
    print(f"Wrote {dest} with {len(rows)} streams ({total/3600:.1f} total hours).")


if __name__ == "__main__":
    main()
