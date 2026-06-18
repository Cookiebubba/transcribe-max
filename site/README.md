# CNVS FAQ — deployable site

A single self-contained static page: [`index.html`](./index.html) (the CNVS FAQ).

## Deploy on Vercel (manual)

1. Vercel → **Add New… → Project**, import the `cookiebubba/transcribe-max` repo.
2. Set **Root Directory** to `site`.
3. **Framework Preset:** Other. No build command, no install command — it's a static file.
4. Deploy. `index.html` is served at the project root.

The page has no build step and only one external dependency (Google Fonts),
so it works as-is on any static host.
