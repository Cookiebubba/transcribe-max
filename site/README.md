# CNVS FAQ — deployable site

Self-contained static pages:

- [`index.html`](./index.html) — the CNVS FAQ.
- [`bingo.html`](./bingo.html) — **Max Blade Stream Bingo**: a lore-accurate,
  light-mode bingo game built from the 58 transcribed streams. Click **NEW CARD**
  for a fresh weighted board (center is a locked “wake up” free space); mark a
  slot when it happens live; five in a row triggers a confetti BINGO. No build
  step, only Google Fonts as an external dependency.

## Deploy on Vercel (manual)

1. Vercel → **Add New… → Project**, import the `cookiebubba/transcribe-max` repo.
2. Set **Root Directory** to `site`.
3. **Framework Preset:** Other. No build command, no install command — it's a static file.
4. Deploy. `index.html` is served at the project root.

The page has no build step and only one external dependency (Google Fonts),
so it works as-is on any static host.
