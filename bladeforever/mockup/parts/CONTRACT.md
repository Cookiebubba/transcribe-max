# Blade Forever — shared build contract

Five modules are being built in parallel and then integrated into one page.
**Read this fully before writing anything.** If you break the contract your
module will not fit and will have to be redone.

Project: **Blade Forever** — a chatter-statistics site for a live-coding YouTube
channel. Members are ranked; each gets a collectible card. The register is
AAA medieval fantasy: a dark, misty, magical hall.

---

## 0. Non-negotiables

1. **Everything original.** "WoW-inspired" and "MMO" describe a *genre*, not a
   source to copy. Do not reproduce any existing game's UI assets, logos,
   frames, icons, fonts or trade dress, and do not render any recognisable
   copyrighted character. Invent your own.
2. **No sharp corners anywhere.** Cards use `var(--r-card)` (20px). Nothing in
   the UI is below `var(--r-sm)` (10px). This is a hard rule.
3. **Borders are the exception, not the default.** Do not outline things out of
   habit. Separate elements with depth, glass, shadow, spacing and contrast
   instead of strokes. Where a line is genuinely needed, make it a soft inset
   highlight (`var(--glass-edge)`), not a hard 1px stroke.
   *The one exception:* the collectible card itself carries a real sculpted
   frame — that is the hero object and is allowed to be ornate.
4. **Single committed dark theme.** No light mode. Set colours from tokens only.
5. **No external resources** except Google Fonts. No image files, no CDN
   libraries, no `fetch`. Everything is CSS, SVG, canvas or WebGL you write.
6. **`prefers-reduced-motion: reduce` must disable all animation** in your module.
7. **Must work at 390px wide** with no horizontal overflow.
8. Write real, working, self-contained code. No TODOs, no placeholder comments
   standing in for logic.

## 1. Design tokens — use these, never literals

Defined centrally; assume they exist. Do **not** redefine them (except the brand
module, which owns the three font families).

```css
/* ground */      --void:#07080b;  --deep:#0d1016;  --mist:#161b25;  --raise:#1d2430;
/* glass */       --glass:rgba(22,27,37,.55); --glass-2:rgba(30,37,50,.42);
                  --glass-hi:rgba(255,255,255,.07); --glass-edge:rgba(255,255,255,.10);
/* ink */         --ink:#e8e2d4; --ink-dim:#a8a596; --ink-faint:#737892;
/* parchment */   --parch:#e8dcc0; --parch-2:#d6c49e; --parch-ink:#2c2418; --parch-rule:#b9a57d;
/* accent */      --ember:#e0954a; --ember-deep:#b4621f; --arcane:#7aa8d8;
                  --gold:#c7a765; --verd:#6f9268; --blood:#9c3b3b;
/* tiers */       --t-ascendant:#e0954a; --t-exalted:#c7a765; --t-honored:#9fb3c8;
                  --t-tempered:#8a7a5e; --t-footman:#5a6372;
/* radius */      --r-card:20px; --r-lg:18px; --r-md:14px; --r-sm:10px; --r-pill:999px;
/* type */        --display: …; --body: …; --data: …;   /* brand module sets these */
```

## 2. The member object — code against this exact shape

```js
{
  handle:"@humblelifeskills", name:"humblelifeskills", initials:"HU",
  rank:1, tier:"ascendant",            // ascendant|exalted|honored|tempered|footman
  level:54, title:"First of the Hall", cls:"Warden", weapon:"Oathsteel",
  stats:{ MIG:98, VIG:60, INS:42, RES:24 },           // 0–99
  personality:{ curious:78, supportive:91, technical:64, humorous:52, persistent:70 }, // 0–100
  hive:{ suggestions:41, used:7, acceptRate:0.17, topCategory:"feature", bestScore:0.91 },
  chat:{ messages:107, streams:38, firstSeen:"2026-05-02", lastSeen:"2026-10-20",
         streak:6, superchatTotal:0, months:4 },
  history:[ {day:45, messages:12}, {day:46, messages:31} ],   // chronological
  badges:[ {slug:"mod-squad", name:"Mod Squad", rarity:"legendary"} ]
}
```

Tier → accent colour: use `var(--t-<tier>)`.

## 3. Module boundaries

| Module | Owns | File |
|---|---|---|
| shader | the page background | `parts/shader.js` |
| card3d | the collectible card object | `parts/card3d.js` + `parts/card3d.css` |
| stats | the right-hand stats panel | `parts/stats.js` + `parts/stats.css` |
| brand | wordmark, fonts, buttons, text styles | `parts/brand.css` + `parts/brand.md` |
| data | the member dataset + merge logic | `parts/data.js` + `parts/data.md` |

Stay inside your file. Do not edit another module's file or the main page.
Do not define `:root` tokens other than the ones your module owns.

**Export style:** each JS module attaches one global, e.g.
`window.BF_SHADER = { mount(el){…}, destroy(){} }`. No ES module syntax, no
bundler. Assume your file is loaded with a plain `<script>` before use.

## 4. Layout the integration will use

```
┌─ shader background (fixed, behind everything) ───────────────┐
│  header: wordmark + nav                                      │
│  MAIN LIST  → a ranked list of names. Almost no chrome:      │
│               no borders, no boxes. Just type on mist.       │
│  CARD VIEW  → split. LEFT: the 3D card. RIGHT: stats panel.  │
└──────────────────────────────────────────────────────────────┘
```

At <900px the card view stacks: card on top, stats below.

## 5. Quality bar

"Nothing is basic. Everything is tastefully styled — even the buttons, even the
text." Treat that as the acceptance test. A plain `<button>`, a default
`<table>`, or unstyled body text is a failure. But restraint reads as expensive
and clutter reads as cheap: spend the detail on hierarchy, spacing and material,
not on ornament for its own sake.
