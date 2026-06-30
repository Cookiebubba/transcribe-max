"""Shared Graphiti setup + transcript chunking for MaxBladeTv stream memory.

Graphiti (https://github.com/getzep/graphiti) builds a temporal knowledge graph
from the stream transcripts so you can do hybrid semantic + keyword + graph
search over ~188 hours of content.

Backend: Neo4j by default (see memory/docker-compose.yml). FalkorDB also works —
set GRAPHITI_DB=falkordb and the host/port env vars.

LLM / embeddings are chosen by which API keys are present:
  * ANTHROPIC_API_KEY  -> Claude for extraction (default), Voyage for embeddings
                          (needs VOYAGE_API_KEY)
  * OPENAI_API_KEY     -> OpenAI for everything (single-key mode)

Env overrides: GRAPHITI_PROVIDER, GRAPHITI_LLM_MODEL, GRAPHITI_SMALL_MODEL,
GRAPHITI_EMBED_MODEL, GRAPHITI_EMBED_DIM, NEO4J_URI/NEO4J_USER/NEO4J_PASSWORD.
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "streams.json"
TRANSCRIPTS = ROOT / "transcripts"


# --------------------------------------------------------------------------- #
# Transcript -> episodes
# --------------------------------------------------------------------------- #
@dataclass
class Episode:
    name: str
    body: str
    reference_time: datetime
    group_id: str
    source_description: str


def _parse_published(ts: str) -> datetime:
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except ValueError:
        return datetime.now(timezone.utc)


def chunk_transcript(stream: dict, chunk_chars: int = 6000) -> list[Episode]:
    """Split one transcript's segments into ~chunk_chars episodes, preserving
    the timestamp of each chunk so Graphiti can place it on the timeline."""
    jpath = TRANSCRIPTS / f"{stream['slug']}.json"
    if not jpath.exists():
        return []
    data = json.loads(jpath.read_text(encoding="utf-8"))
    segments = data.get("segments", [])
    if not segments:
        return []

    published = _parse_published(stream["published_at"])
    episodes: list[Episode] = []
    buf: list[str] = []
    buf_len = 0
    chunk_start = segments[0]["start"]
    idx = 1

    def flush(start_off: float):
        nonlocal buf, buf_len, idx
        if not buf:
            return
        ref = published + timedelta(seconds=float(start_off))
        episodes.append(
            Episode(
                name=f"{stream['slug']} part {idx}",
                body=" ".join(buf),
                reference_time=ref,
                group_id=stream["slug"],
                source_description=(
                    f"{stream['title']} ({stream['url']}) @ "
                    f"{int(start_off)//3600:02d}:{int(start_off)%3600//60:02d}"
                ),
            )
        )
        idx += 1
        buf = []
        buf_len = 0

    for seg in segments:
        if buf_len and buf_len + len(seg["text"]) > chunk_chars:
            flush(chunk_start)
            chunk_start = seg["start"]
        if not buf:
            chunk_start = seg["start"]
        buf.append(seg["text"])
        buf_len += len(seg["text"]) + 1
    flush(chunk_start)
    return episodes


def load_streams(only: str | None = None, limit: int | None = None) -> list[dict]:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    streams = sorted(manifest["streams"], key=lambda s: s["published_at"])
    streams = [s for s in streams if (TRANSCRIPTS / f"{s['slug']}.json").exists()]
    if only:
        streams = [s for s in streams if only in (s["slug"], s["video_id"])]
    if limit:
        streams = streams[:limit]
    return streams


# --------------------------------------------------------------------------- #
# Graphiti client factory
# --------------------------------------------------------------------------- #
def _provider() -> str:
    p = os.environ.get("GRAPHITI_PROVIDER")
    if p:
        return p.lower()
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "anthropic"
    if os.environ.get("OPENAI_API_KEY"):
        return "openai"
    raise SystemExit(
        "No LLM provider configured. Set ANTHROPIC_API_KEY (+VOYAGE_API_KEY) "
        "or OPENAI_API_KEY. See memory/.env.example."
    )


def build_graphiti():
    """Construct a configured Graphiti instance. Import is lazy so --dry-run and
    chunking work without the heavy deps / network."""
    from graphiti_core import Graphiti
    from graphiti_core.llm_client.config import LLMConfig

    provider = _provider()

    if provider == "anthropic":
        from graphiti_core.llm_client.anthropic_client import AnthropicClient

        llm = AnthropicClient(
            LLMConfig(
                api_key=os.environ["ANTHROPIC_API_KEY"],
                model=os.environ.get("GRAPHITI_LLM_MODEL", "claude-sonnet-5"),
                small_model=os.environ.get("GRAPHITI_SMALL_MODEL", "claude-haiku-4-5-20251001"),
            )
        )
        embedder, cross_encoder = _embedder_and_reranker_for_anthropic()
    elif provider == "openai":
        from graphiti_core.llm_client.openai_client import OpenAIClient
        from graphiti_core.embedder.openai import OpenAIEmbedder, OpenAIEmbedderConfig
        from graphiti_core.cross_encoder.openai_reranker_client import OpenAIRerankerClient

        key = os.environ["OPENAI_API_KEY"]
        llm = OpenAIClient(
            LLMConfig(api_key=key, model=os.environ.get("GRAPHITI_LLM_MODEL", "gpt-4.1-mini"))
        )
        embedder = OpenAIEmbedder(
            OpenAIEmbedderConfig(
                api_key=key,
                embedding_model=os.environ.get("GRAPHITI_EMBED_MODEL", "text-embedding-3-small"),
                embedding_dim=int(os.environ.get("GRAPHITI_EMBED_DIM", "1536")),
            )
        )
        cross_encoder = OpenAIRerankerClient(client=llm, config=llm.config)
    else:
        raise SystemExit(f"Unknown GRAPHITI_PROVIDER: {provider}")

    graph_driver = _graph_driver()
    if graph_driver is not None:
        return Graphiti(graph_driver=graph_driver, llm_client=llm, embedder=embedder, cross_encoder=cross_encoder)
    return Graphiti(
        uri=os.environ.get("NEO4J_URI", "bolt://localhost:7687"),
        user=os.environ.get("NEO4J_USER", "neo4j"),
        password=os.environ.get("NEO4J_PASSWORD", "password"),
        llm_client=llm,
        embedder=embedder,
        cross_encoder=cross_encoder,
    )


def _embedder_and_reranker_for_anthropic():
    # Anthropic has no embeddings API -> use Voyage (preferred) or OpenAI.
    if os.environ.get("VOYAGE_API_KEY"):
        from graphiti_core.embedder.voyage import VoyageAIEmbedder, VoyageAIEmbedderConfig

        embedder = VoyageAIEmbedder(
            VoyageAIEmbedderConfig(
                api_key=os.environ["VOYAGE_API_KEY"],
                embedding_model=os.environ.get("GRAPHITI_EMBED_MODEL", "voyage-3.5"),
                embedding_dim=int(os.environ.get("GRAPHITI_EMBED_DIM", "1024")),
            )
        )
    elif os.environ.get("OPENAI_API_KEY"):
        from graphiti_core.embedder.openai import OpenAIEmbedder, OpenAIEmbedderConfig

        embedder = OpenAIEmbedder(
            OpenAIEmbedderConfig(
                api_key=os.environ["OPENAI_API_KEY"],
                embedding_model=os.environ.get("GRAPHITI_EMBED_MODEL", "text-embedding-3-small"),
                embedding_dim=int(os.environ.get("GRAPHITI_EMBED_DIM", "1536")),
            )
        )
    else:
        raise SystemExit("Anthropic mode needs an embedder: set VOYAGE_API_KEY or OPENAI_API_KEY.")

    # Reranking is optional. Use OpenAI reranker only if a key is present; otherwise
    # skip it (hybrid semantic+BM25 search still works).
    cross_encoder = None
    if os.environ.get("OPENAI_API_KEY"):
        from graphiti_core.llm_client.openai_client import OpenAIClient
        from graphiti_core.llm_client.config import LLMConfig
        from graphiti_core.cross_encoder.openai_reranker_client import OpenAIRerankerClient

        rk = OpenAIClient(LLMConfig(api_key=os.environ["OPENAI_API_KEY"], model="gpt-4.1-mini"))
        cross_encoder = OpenAIRerankerClient(client=rk, config=rk.config)
    return embedder, cross_encoder


def _graph_driver():
    if os.environ.get("GRAPHITI_DB", "neo4j").lower() == "falkordb":
        from graphiti_core.driver.falkordb_driver import FalkorDriver

        return FalkorDriver(
            host=os.environ.get("FALKORDB_HOST", "localhost"),
            port=int(os.environ.get("FALKORDB_PORT", "6379")),
        )
    return None  # -> Graphiti() uses its Neo4j driver from uri/user/password
