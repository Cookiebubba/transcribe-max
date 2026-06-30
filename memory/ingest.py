#!/usr/bin/env python3
"""Ingest MaxBladeTv stream transcripts into a Graphiti knowledge graph.

Each transcript is chunked into timestamped episodes and added to Graphiti,
which uses an LLM to extract entities/relationships and embeddings for semantic
search. One `group_id` per stream keeps streams separable.

⚠️  Cost & time: this runs MANY LLM calls (one+ per chunk). All 56 transcripts
(~1.1M words) is thousands of chunks — expect real API spend and a long run.
Start small and use --dry-run to size the job first.

Examples:
    python memory/ingest.py --dry-run                 # count episodes, no API calls
    python memory/ingest.py --only day-46-iSy9MB15csw # one stream
    python memory/ingest.py --limit 3                 # first 3 streams (oldest)
    python memory/ingest.py --max-chunks 5            # cap chunks/stream (sampling)
    python memory/ingest.py                           # everything (be ready to pay)

Setup: see memory/README is in the project README; needs a running Neo4j
(memory/docker-compose.yml) and API keys (memory/.env.example).
"""
from __future__ import annotations

import argparse
import asyncio

from graphiti_memory import build_graphiti, chunk_transcript, load_streams


async def run(args) -> int:
    streams = load_streams(only=args.only, limit=args.limit)
    if not streams:
        print("No matching streams with transcripts found.")
        return 1

    plan = [(s, chunk_transcript(s, args.chunk_chars)) for s in streams]
    if args.max_chunks:
        plan = [(s, eps[: args.max_chunks]) for s, eps in plan]
    total_eps = sum(len(eps) for _, eps in plan)
    total_chars = sum(len(e.body) for _, eps in plan for e in eps)
    print(f"Streams: {len(plan)} · episodes (LLM calls): {total_eps} · chars: {total_chars:,}")

    if args.dry_run:
        for s, eps in plan:
            print(f"  {s['slug']}: {len(eps)} episodes")
        print("\nDry run only — no graph written, no API calls.")
        return 0

    graphiti = build_graphiti()
    done = 0
    try:
        await graphiti.build_indices_and_constraints()
        for s, eps in plan:
            prev: list[str] = []
            for ep in eps:
                from graphiti_core.nodes import EpisodeType

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
    finally:
        close = getattr(graphiti, "close", None)
        if close:
            await close()
    print(f"\nIngested {done} episodes into the graph.")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Ingest transcripts into Graphiti.")
    ap.add_argument("--only", help="Single stream by slug or video id.")
    ap.add_argument("--limit", type=int, help="Only the first N streams (oldest first).")
    ap.add_argument("--max-chunks", type=int, help="Cap episodes per stream (sampling).")
    ap.add_argument("--chunk-chars", type=int, default=6000, help="Approx chars per episode (default 6000).")
    ap.add_argument("--dry-run", action="store_true", help="Count work without calling any API.")
    return asyncio.run(run(ap.parse_args()))


if __name__ == "__main__":
    raise SystemExit(main())
