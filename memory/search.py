#!/usr/bin/env python3
"""Semantic memory search over the MaxBladeTv stream knowledge graph.

Runs Graphiti's hybrid search (semantic embeddings + BM25 + graph) over the
facts extracted by ingest.py and prints the matching relationships.

Examples:
    python memory/search.py "what did he say about pricing getclippo"
    python memory/search.py "MRR milestones" --num 15
    python memory/search.py "claude vs cursor" --group day-43-E07ps2b843Y
"""
from __future__ import annotations

import argparse
import asyncio

from graphiti_memory import build_graphiti


async def run(args) -> int:
    graphiti = build_graphiti()
    try:
        results = await graphiti.search(
            query=args.query,
            num_results=args.num,
            group_ids=[args.group] if args.group else None,
        )
    finally:
        close = getattr(graphiti, "close", None)
        if close:
            await close()

    if not results:
        print("No results. Have you run memory/ingest.py yet?")
        return 0

    print(f"Top {len(results)} facts for: {args.query!r}\n")
    for i, edge in enumerate(results, 1):
        fact = getattr(edge, "fact", "")
        valid = getattr(edge, "valid_at", None)
        when = f"  ({valid:%Y-%m-%d})" if valid else ""
        print(f"{i:>2}. {fact}{when}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Search the stream knowledge graph.")
    ap.add_argument("query", help="Natural-language query.")
    ap.add_argument("--num", type=int, default=10, help="Number of facts to return (default 10).")
    ap.add_argument("--group", help="Restrict to one stream's group_id (its slug).")
    return asyncio.run(run(ap.parse_args()))


if __name__ == "__main__":
    raise SystemExit(main())
