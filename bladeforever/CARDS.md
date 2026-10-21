# Blade Forever — card system

Information is organised the way a trading card organises it (name/level bar,
art, type line, stat block, ability text, footer). The *treatment* is medieval
dark fantasy: flat stone slabs, hairline iron rules, inset bevels, a single
ember light source. Austere, not ornamental — no filigree or scrollwork.

All frames, class names, weapon names and art are original to this project.

## Trait → card element

| Real measurement | Card element | Ready? |
|---|---|---|
| Lifetime messages | Level (1–60) and **MIGHT** | ✅ real today |
| Rank on the ledger | Tier, frame colour, effect | ✅ real today |
| Moderator badge | Class — **Warden** | ✅ real today |
| Membership flag | Class — **Oathsworn** | ✅ real today |
| Streams attended | **VIGOUR** | ⏳ needs backfill |
| Prompts used on stream | **INSIGHT**, Class — **Artificer** | ⏳ needs hivecoding.gg join |
| Tenure / consecutive streams | **RESOLVE** | ⏳ needs backfill |
| Months a member | Weapon tier | ⏳ needs backfill |
| Super Chats | Patron sigil, gold trim | ⏳ needs backfill |

Four stats, not six. Each maps to something the database already counts;
nothing is invented to fill a slot.

## The effect ladder

Rank decides how much the card moves. Only the top ten animate on their own, so
a page of two hundred cards doesn't crawl and the top stays visibly rarer.

| Tier | Ranks | Treatment | Also |
|---|---|---|---|
| **Ascendant** | 1–5 | Animated: ember motes, light sweep, pulsing edge | Modelled + rigged for the Duel |
| **Exalted** | 6–10 | Animated: slow light sweep | Gold-iron frame |
| **Honoured** | 11–25 | Holo sheen on hover | Steel frame |
| **Tempered** | 26–100 | Tilt on hover, no sheen | Bronze frame |
| **Footman** | 101+ | None — flat stone | Everyone still gets a card |

## Classes

Derived from the dominant trait, checked in this order:

| Class | Earned by |
|---|---|
| Warden | holds the moderator badge |
| Artificer | ≥ 3 suggestions used on stream |
| Oathsworn | channel member |
| Chronicler | ≥ 80 messages |
| Journeyman | ≥ 40 messages |
| Wanderer | default |

## Weapons, by membership length

The Duel gives a fighter the blade their real member status earned.

| Blade | Months a member |
|---|---|
| Notched Iron | not a member |
| Footman's Sword | 1–2 |
| **Oathsteel** | 3–5 — three months also auto-qualifies for the Duel |
| Emberbrand | 6–11 |
| **Bladeforever** | 12+ — the relic the site is named for |

## Card art pipeline

Layered, three deep:

1. **Scene** — generated backdrop (Higgsfield), original, no faces or figures,
   composed with empty space for the medallion and a dark band for the stats.
2. **Portrait medallion** — the member's real YouTube avatar, normalised to
   512px, in an iron ring.
3. **Frame + effects** — CSS, tier-driven.

The scene is generated per rarity band, not per member, so the set looks like a
set and the cost stays flat.

## On the holofoil reference

`simeydotme/pokemon-cards-css` is **GPL-3.0**, and copyleft triggers on
distribution, not on charging money — serving the CSS/JS to a visitor's browser
distributes it. Using it means licensing Blade Forever's frontend as GPL-3.0 and
offering the source. That is a fine choice if the source being public is fine.

It is also tuned to recreate one specific card era's holofoil, which is the
opposite of this brief, so the effect CSS here is written from scratch for the
tier ladder above.

## Open questions

- Is the Duel **played** by visitors, or a **spectacle** that resolves from the
  two fighters' stats? The second is far cheaper to ship.
- Are cards opt-in or opt-out for members?
- Is the ledger all-time, rolling-90-day, or both?

---

## Card scene: parallax layer stack

The portrait window is a six-layer parallax scene, each layer on its own depth
plane so tilting the card produces real separation rather than a flat image.

| Layer | z | Contents |
|---|---|---|
| far background | 0 | sky, moon, ridge |
| near background | 9 | twin spires, braziers |
| leading lines | 18 | arch ribs, light shafts, banners — draw the eye to centre |
| floor | 27 | perspective tiles, contact shadow |
| **character** | **36** | the swappable figure (see below) |
| foreground | 43 | broken pillar, low arch, rubble — occludes the character |
| fog | 46 | atmospheric haze |
| frame | 56 | the metal frame, sits over the window edge |

**Masking.** Nothing may render outside the card border. Each scene plane is
clipped by its own `.bf-win` leaf (arch radius + `overflow:hidden`), and each
scene SVG also carries its own `<clipPath>` of the same arch. Crucially, no
clipping is applied to an ancestor inside the 3D chain — `overflow`,
`clip-path` or `filter` on an ancestor flattens `preserve-3d` and destroys the
parallax. Any future layer must follow the same rule.

**Known limit.** At steep free-spin the plane deck visibly separates. That is
inherent to a `preserve-3d` stack with genuine depth — the card *is* a deck of
planes, so a steep viewing angle shows its spread. It is not a clipping bug and
cannot be fixed by more clipping. The options are to clamp the spin angle, to
collapse the z-spread (which costs the parallax), or to accept it as the card
behaving like a physical object. Undecided.

**Material.** The card body is deliberately translucent: `.bf-core` is `--mist`
at 70% with `backdrop-filter: blur(18px) saturate(1.35)` — the "dark liquid
glass" brief. It is meant to pick up the background behind it. Testing it
against a bright flat colour will make correct behaviour look broken.

**Swapping the character.** `BF_CARD.characterSlot()` returns the live
`.bf-character` node; `slot.replaceChildren(imgOrCanvasOrWebGL)` swaps it. It is
already clipped to the arch and needs nothing else changed. `BF_CARD.pose`
exposes `{rx, ry, spin, nx, ny}` each frame so a 3D character can be aimed to
match the card's tilt. This is the hook for the modelled, rigged fighters.
