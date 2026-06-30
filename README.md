# transcribe-max

Transcripts of **every live stream** from the YouTube channel
[Max Blade — @MaxBladeTv](https://www.youtube.com/@MaxBladeTv), plus the tooling
to (re)generate them.

The channel's streams are its **ended live broadcasts** (the "Day N – Vibe
Coding Until I Buy My Family a House" series and a few others). These live in the
channel's **Live tab**, not the normal Videos tab, and the series playlist isn't
publicly enumerable by scrapers — so this repo reads the `/streams` page directly.

## What's here

| Path | What it is |
|------|------------|
| [`transcripts/INDEX.md`](transcripts/INDEX.md) | Browsable table of all streams + transcript links |
| `transcripts/<slug>.md` | Human-readable transcript (header + metadata + text) |
| `transcripts/<slug>.json` | Structured transcript: metadata + timestamped `segments` + `full_text` |
| `streams.json` | Authoritative manifest of every stream (id, title, date, duration, slug) |
| `transcribe.py` | Generate transcripts from YouTube captions with `yt-dlp` |
| `refresh_streams.py` | Re-enumerate the channel's streams via Apify (updates `streams.json`) |
| `scripts/` | Build helpers (manifest seed, SRT→transcript, index) |

Slugs are `day-NN-<videoId>` for the numbered series and `stream-<videoId>`
otherwise.

## Results (snapshot 2026-06-18)

- **62 streams** found on the channel (~188 hours of video).
- **56 transcribed** — **1,105,254 words**, 187,886 timestamped segments.
- **6 not transcribed** because they have **no English captions** on YouTube:
  the 49-second test stream, three Jan-2025 streams, Day 8, and **Day 46**
  (today's stream — YouTube hadn't finished generating auto-captions yet).
  Re-running `transcribe.py` later will pick up any that gain captions.

These are **caption-based** transcripts (YouTube auto-generated captions). No
audio/Whisper transcription is performed, so streams without captions are
skipped rather than transcribed.

## Regenerate / update

Run these where YouTube is reachable (a normal machine — not a locked-down CI
sandbox; datacenter IPs are often blocked by YouTube).

```bash
pip install -r requirements.txt

# 1. (optional) refresh the stream list from the live channel via Apify
export APIFY_TOKEN=apify_api_xxxxxxxx      # already set in this project's env
python refresh_streams.py

# 2. transcribe every stream that doesn't have a transcript yet
python transcribe.py

# handy flags
python transcribe.py --force                 # re-fetch everything
python transcribe.py --only day-46-iSy9MB15csw   # one stream (slug or video id)
python transcribe.py --lang en               # caption language
python transcribe.py --list                  # list the manifest

# 3. rebuild the index
python scripts/build_index.py
```

`transcribe.py` is idempotent: it skips streams that already have output unless
you pass `--force`.

## Semantic memory search (Graphiti)

`memory/` adds an optional [Graphiti](https://github.com/getzep/graphiti)
pipeline that builds a temporal **knowledge graph** from the transcripts so you
can do hybrid **semantic + keyword + graph** search over the streams ("what did
he say about pricing getclippo?", "when did MRR cross $30k?").

This needs infrastructure that the build sandbox doesn't have, so it ships as
ready-to-run tooling rather than a pre-built graph:

```bash
pip install -r memory/requirements.txt

# 1. start a graph database (Neo4j)
docker compose -f memory/docker-compose.yml up -d

# 2. configure keys (Claude+Voyage, or single-key OpenAI)
cp memory/.env.example memory/.env && $EDITOR memory/.env
set -a; . memory/.env; set +a

# 3. size the job first — NO API calls
python memory/ingest.py --dry-run                 # full corpus
python memory/ingest.py --dry-run --limit 3       # just a sample

# 4. ingest (start small!), then search
python memory/ingest.py --limit 3                 # 3 oldest streams
python memory/search.py "what did he say about pricing getclippo"
python memory/ingest.py                           # everything, once you're happy
```

⚠️ **Cost/time:** ingesting all 56 transcripts is **~985 episodes**, i.e. ~985+
LLM extraction calls plus embeddings — real API spend and a long run. Use
`--dry-run`, `--limit`, and `--max-chunks` to control it; start with a few
streams. Provider/model/back-end are all configurable via `memory/.env`
(defaults: Claude `claude-sonnet-5` for extraction + Voyage embeddings; Neo4j).

> If you only need plain semantic lookup (not a knowledge graph), a vector
> store over `transcripts/*.json` (e.g. Chroma/LanceDB + embeddings) is cheaper
> and simpler — ask and I can add that instead.

## How the transcripts in this repo were produced

The repo was bootstrapped in a sandbox with **no direct access to YouTube or the
Apify REST API** (only the Apify MCP gateway). Captions were fetched with the
[`streamers/youtube-scraper`](https://apify.com/streamers/youtube-scraper) Apify
actor against the channel's `/streams` page (`downloadSubtitles=true`,
`subtitlesLanguage=en`, SRT format, auto-captions preferred), then converted to
the Markdown + JSON layout with `scripts/srt_to_transcript.py`.

For your own runs, `transcribe.py` (yt-dlp) is simpler and free — it just needs
to reach YouTube. `refresh_streams.py` shows the Apify path for re-enumerating
streams when the tab/playlist scrapers can't.
