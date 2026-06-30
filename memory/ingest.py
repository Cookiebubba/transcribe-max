#!/usr/bin/env python3
"""Ingest MaxBladeTv stream transcripts into a Graphiti knowledge graph.

Each transcript is chunked into timestamped episodes and added to Graphiti,
which uses an LLM to extract entities/relationships and embeddings for semantic
search. One `group_id` per stream keeps streams separable.

Incremental by default: a stream that's already been ingested (tracked in
memory/.ingest_state.json) is skipped, so re-running after new streams appear
only adds the new ones. Use --reingest to force.

⚠️  Cost & time: this runs MANY LLM calls (one+ per chunk). All 56 transcripts
(~1.1M words) is ~985 chunks — expect real API spend and a long run. Start small
and use --dry-run to size the job first.

Examples:
    python memory/ingest.py --dry-run                 # count episodes, no API calls
    python memory/ingest.py --only day-46-iSy9MB15csw # one stream
    python memory/ingest.py --limit 3                 # first 3 streams (oldest)
    python memory/ingest.py --max-chunks 5            # cap chunks/stream (sampling)
    python memory/ingest.py                           # all not-yet-ingested streams
    python memory/ingest.py --reingest --only <slug>  # force re-ingest one stream
"""
from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path

from graphiti_memory import build_graphiti, chunk_transcript, load_streams

STATE_FILE = Path(__file__).resolve().parent / ".ingest_state.json"


def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    return {"streams": {}}


def save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")


async def run(args) -> int:
    state = load_state()
    ingested = state["streams"]

    streams = load_streams(only=args.only, limit=args.limit)
    if not streams:
        print("No matching streams with transcripts found.")
        return 1

    # Build the per-stream plan, skipping already-ingested streams unless --reingest.
    plan, skipped = [], []
    for s in streams:
        if s["slug"] in ingested and not args.reingest:
            skipped.append(s["slug"])
            continue
        eps = chunk_transcript(s, args.chunk_chars)
        if args.max_chunks:
            eps = eps[: args.max_chunks]
        plan.append((s, eps))

    total_eps = sum(len(eps) for _, eps in plan)
    total_chars = sum(len(e.body) for _, eps in plan for e in eps)
    print(
        f"To ingest: {len(plan)} stream(s) · {total_eps} episodes (LLM calls) · "
        f"{total_chars:,} chars" + (f" · skipping {len(skipped)} already done" if skipped else "")
    )

    if args.dry_run:
        for s, eps in plan:
            print(f"  + {s['slug']}: {len(eps)} episodes")
        for slug in skipped:
            print(f"  = {slug}: already ingested (skip)")
        print("\nDry run only — no graph written, no API calls.")
        return 0

    if not plan:
        print("Nothing to do (everything already ingested). Use --reingest to redo.")
        return 0

    graphiti = build_graphiti()
    from graphiti_core.nodes import EpisodeType

    done = 0
    try:
        await graphiti.build_indices_and_constraints()
        for s, eps in plan:
            prev: list[str] = []
            for ep in eps:
                res = await graphiti.add_episode(
                    name=ep.name,
                    episode_body=ep.body,
                    source_description=ep.source_description,
                    reference_time=ep.reference_time,
                    source=EpisodeType.text,
                    group_id=ep.group_id,
                    previous_episode_uuids=prev or None,
                )
                ep_uuid = getattr(getattr(res, "episode", None), "uuid", None)
                prev = [ep_uuid] if ep_uuid else prev
                done += 1
                print(f"  [{done}/{total_eps}] {ep.name}", flush=True)
            # mark this stream done only after all its episodes succeeded
            ingested[s["slug"]] = {"episodes": len(eps), "group_id": s["slug"]}
            save_state(state)
    finally:
        close = getattr(graphiti, "close", None)
        if close:
            await close()
    print(f"\nIngested {done} episodes across {len(plan)} stream(s). State: {STATE_FILE.name}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Ingest transcripts into Graphiti.")
    ap.add_argument("--only", help="Single stream by slug or video id.")
    ap.add_argument("--limit", type=int, help="Only the first N streams (oldest first).")
    ap.add_argument("--max-chunks", type=int, help="Cap episodes per stream (sampling).")
    ap.add_argument("--chunk-chars", type=int, default=6000, help="Approx chars per episode (default 6000).")
    ap.add_argument("--reingest", action="store_true", help="Re-ingest even if already done.")
    ap.add_argument("--dry-run", action="store_true", help="Count work without calling any API.")
    return asyncio.run(run(ap.parse_args()))


if __name__ == "__main__":
    raise SystemExit(main())
