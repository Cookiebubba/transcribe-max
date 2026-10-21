# Blade Forever — brand module

## Paste into `<head>` (exact)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;900&family=IBM+Plex+Mono:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
```

Then `<link rel="stylesheet" href="parts/brand.css">` (after the central token `:root`; brand.css only sets `--display --body --data` and `--fs-*`).

## Fonts

- `--display` **Cinzel** (700/900): Roman-inscription capitals, carved-stone feel, still crisp at 13px uppercase with tracking. Use for headings, labels, buttons, nav, chips.
- `--body` **Source Serif 4** (400/600/italic, optical sizing): sturdy, open, very legible at 13-16px on parchment and on dark.
- `--data` **IBM Plex Mono** (400-600): true tabular figures; columns of stats align. Use `.num` / `.t-data`.

## Type scale (ratio 1.2, minor third, base 16px)

| role | token | size |
|---|---|---|
| caption / `.t-caption` | `--fs--2` | 11.1px |
| small, label / `.t-small`, `.t-label` | `--fs--1` | 13.3px |
| body | `--fs-0` | 16px |
| h4 | `--fs-1` | 19.2px |
| h3 | `--fs-2` | 23px |
| h2 | `--fs-3` (fluid) | 23-27.6px |
| h1 | `--fs-5` (fluid) | 27.6-39.8px |

Extras: `.t-lead`, `.t-eyebrow`, `.t-label` (tracked caps), `.on-parch` (flip ink on parchment surfaces).

## Class reference

- Buttons: `.btn` + `.btn--primary | --secondary | --ghost`, sizes `.btn--sm`, `.btn--icon`. States: hover, active, disabled (`:disabled` or `aria-disabled`), `:focus-visible`.
- Nav: `.nav` > `.nav-item`; active = `aria-current="page"` or `.is-active`.
- Chips: `.chip .chip--ascendant|exalted|honored|tempered|footman` (also `.tier--*` sets `--c`), `.pill`, `.tag`; toggle with `aria-pressed="true"`.
- Forms: `.field`, `.input`, `.input--search`, `.select`, `.textarea`.
- Text: bare `a`, `.link`, `blockquote`/`.quote` (+`cite`), `hr`/`.divider`/`.divider--soft`, `code`, `kbd`.
- Scrollbar and `::selection` are styled globally.

## Wordmark

A gold ring pierced by a faceted blade (the broken ring = unbroken "forever"); "BLADE" in gold-gradient Cinzel Black, "FOREVER" in ink. The SVG uses `var(--display)` via class `wm-t`, so Cinzel must be loaded. Each SVG carries its own `<defs>` (identical ids are harmless when repeated; never put the defs in a `display:none` SVG).

Sizes: `.wm` (28px), `.wm--lg` (56), `.wm--xl` (96), `.wm--xxl` (120). Tagline: add `<span class="wm__tag">…</span>`. Mark-only: `.wm--mark`, or `.wm--responsive` to swap to the mark under 520px.

```html
<a class="wm wm--responsive" href="#" aria-label="Blade Forever">
  <!-- full lockup -->
  <svg class="wm__full" viewBox="0 0 262 40" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bf-wm-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f0d897"/><stop offset=".55" stop-color="#c7a765"/><stop offset="1" stop-color="#8f7638"/>
      </linearGradient>
      <linearGradient id="bf-wm-steel-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4efe2"/><stop offset="1" stop-color="#9fb3c8"/></linearGradient>
      <linearGradient id="bf-wm-steel-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb3c8"/><stop offset="1" stop-color="#4b5870"/></linearGradient>
    </defs>
    <g>
      <circle cx="20" cy="21" r="15.5" fill="none" stroke="url(#bf-wm-gold)" stroke-width="3"/>
      <path d="M20 1 24.2 8.5V27L20 31.5Z" fill="url(#bf-wm-steel-r)"/>
      <path d="M20 1 15.8 8.5V27L20 31.5Z" fill="url(#bf-wm-steel-l)"/>
      <rect x="9" y="26" width="22" height="4.4" rx="2.2" fill="url(#bf-wm-gold)"/>
      <rect x="18.4" y="30" width="3.2" height="6" rx="1.6" fill="#8f7638"/>
      <circle cx="20" cy="37.2" r="2.2" fill="url(#bf-wm-gold)"/>
    </g>
    <text class="wm-t" x="50" y="29" font-size="25" textLength="210" lengthAdjust="spacing"><tspan class="wm-a">BLADE</tspan><tspan class="wm-b" dx="9">FOREVER</tspan></text>
  </svg>
  <!-- mark only -->
  <svg class="wm__mark" viewBox="0 0 40 40" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bf-wm-gold-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0d897"/><stop offset=".55" stop-color="#c7a765"/><stop offset="1" stop-color="#8f7638"/></linearGradient>
      <linearGradient id="bf-wm-steel-lm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4efe2"/><stop offset="1" stop-color="#9fb3c8"/></linearGradient>
      <linearGradient id="bf-wm-steel-rm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb3c8"/><stop offset="1" stop-color="#4b5870"/></linearGradient>
    </defs>
    <circle cx="20" cy="21" r="15.5" fill="none" stroke="url(#bf-wm-gold-m)" stroke-width="3"/>
    <path d="M20 1 24.2 8.5V27L20 31.5Z" fill="url(#bf-wm-steel-rm)"/>
    <path d="M20 1 15.8 8.5V27L20 31.5Z" fill="url(#bf-wm-steel-lm)"/>
    <rect x="9" y="26" width="22" height="4.4" rx="2.2" fill="url(#bf-wm-gold-m)"/>
    <rect x="18.4" y="30" width="3.2" height="6" rx="1.6" fill="#8f7638"/>
    <circle cx="20" cy="37.2" r="2.2" fill="url(#bf-wm-gold-m)"/>
  </svg>
  <span class="wm__tag">Chatter Chronicle</span>
</a>
```

Note: the full lockup's text is SVG `<text>`; it needs Cinzel loaded (the `display=swap` link will repaint it once loaded).
