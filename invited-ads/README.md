# Invited.you — Meta ad concepts

Unrelated to the rest of this repo. Self-contained work for a separate product,
kept here in its own folder.

## What's here

`invited-meta-ads.html` — a single, self-contained page. Open it in a browser.

It holds ten Meta static ad concepts for [invited.you](https://invited.you),
rendered live as real 4:5 creatives rather than mocked up as images, plus the
research they came out of and the exact copy to paste into Ads Manager.

- 5 dark, 5 light
- Every card is built from the product's own design tokens, lifted verbatim from
  `invited.you/public/style.css`
- Brand type (Creato Display) and the profile imagery load from invited.you at
  view time, so you need to be able to reach that domain for the page to render
  in true brand type. It falls back to system-ui and the layout is unaffected.

## Using it

Two controls in the sticky bar at the top:

- **Export size 1080×1350** — snaps every card to exact pixel dimensions so you
  can screenshot production-ready assets straight out of the page.
- **Safe-zone overlay** — draws the Reels/Stories keep-clear margins over every
  card.

## Two claims are flagged

Concept 07 advertises analytics; I found no analytics surface on the public
site. Concept 04 can carry a founding-places number I couldn't verify. Both are
marked in the page. Confirm before spending.

## How the research was gathered

invited.you is blocked by this environment's network policy, so the site was
read through a headless browser: live DOM of the homepage, `/partners` and
`lewis.invited.you`, the full stylesheet, and full-page renders in both themes.
Competitor positioning came from Linktree's own published ads plus category
reviews and "Linktree alternative" listicles.

Captured 7 August 2026.
