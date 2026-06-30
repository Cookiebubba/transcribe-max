# memory/ — graph-memory database layer

A **standalone semantic-memory layer** over the stream transcripts. It is **not**
part of the website / FAQ in `site/` — it shares the repo but nothing else. It's
a database layer you query.

## Why

Without it, "what did he say about pricing getClippo?" means scanning 56
transcripts (~188 hours / 1.1M words). With it, the transcripts are read **once**
during ingestion and turned into a **knowledge graph + vector index** in a
database ([Neo4j](https://neo4j.com) by default). Queries then hit the index —
they do **not** re-read the transcript files.

```
transcripts/*.json ──(ingest.py, one-time)──▶  Neo4j: entities, relationships,
                                                embeddings  ◀──(search.py)── query
```

- **Ingestion** ([`ingest.py`](ingest.py)) — chunks each transcript into
  timestamped episodes and lets [Graphiti](https://github.com/getzep/graphiti)
  extract entities/relationships + embeddings into the graph. Incremental: it
  skips streams already recorded in `.ingest_state.json`, so after a new stream
  is transcribed you just run it again to add only that one.
- **Search** ([`search.py`](search.py)) — Graphiti hybrid search (semantic
  embeddings + BM25 keyword + graph traversal) over the indexed facts. Sub-second;
  returns relationships/facts, scoped to a stream with `--group <slug>` if wanted.

## Run it

```bash
pip install -r memory/requirements.txt
docker compose -f memory/docker-compose.yml up -d        # Neo4j on bolt://localhost:7687
cp memory/.env.example memory/.env && $EDITOR memory/.env # add API keys
set -a; . memory/.env; set +a

python memory/ingest.py --dry-run        # size the job (no API calls)
python memory/ingest.py --limit 3        # start small
python memory/search.py "MRR milestones"
python memory/ingest.py                  # the rest, when ready (~985 episodes total)
```

## Config (memory/.env)

| Provider | LLM (extraction) | Embeddings | Keys |
|----------|------------------|-----------|------|
| anthropic (default) | Claude `claude-sonnet-5` | Voyage `voyage-3.5` | `ANTHROPIC_API_KEY` + `VOYAGE_API_KEY` |
| openai | `gpt-4.1-mini` | `text-embedding-3-small` | `OPENAI_API_KEY` |

Backend defaults to Neo4j; set `GRAPHITI_DB=falkordb` (+ `FALKORDB_HOST/PORT`) to
use FalkorDB instead. All models/dims are overridable — see `.env.example`.

The graph persists in the database (Neo4j's docker volume), not in this repo;
`.ingest_state.json` (git-ignored) just remembers which streams are already in.
