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

## Card scene: a window into a lit 3D street

The front of the card is a **window**. The arched frame (ring y 14-316 of the
340 x 476 design grid) is the top two-thirds of the card; name, title,
class / weapon and the four stat plates fill the bottom third.

Behind the glass is a real, static 3D scene (`mockup/parts/scene.js`,
`window.BF_SCENE`): a signed-distance-field street raymarched in one WebGL 1
fragment shader. No libraries, no images, no network.

**Portal projection.** The canvas lies on the window plane. In scene space the
window is a rectangle on z = 0; every pixel is a point on it, and its ray runs
from a virtual eye through that point (off-axis projection). Marching starts
at the glass, so nothing can sit in front of the window. The eye is `eyeDist`
in front of the window and moves with the card pose: the viewer direction in
card space, `v = (-cos rx sin ry, -sin rx, cos rx cos ry)`, offsets the eye by
`eyeDist * parallax * (v.x, v.y)`. At pose 0 the view is the straight-on
painting. Points on the glass stay locked to the frame; deeper points slide
further with the eye and you see around near edges (lamp post, arches),
which is what a physical window does.

**Static, rendered on demand.** Nothing in the scene animates. The card calls
`scene.setPose(rx, ry)` only when its pose changes; the scene draws a
reduced-resolution frame while moving and one full frame 170 ms after it
stops. No drawing while the card is off-screen, the tab is hidden, or the
front faces away. DPR is capped at 2. `BF_SCENE.setQuality(q)` (0.35-1) is the
single quality knob (resolution, march steps, shadow steps). After 5 s
without pointer input the card eases back to rest, so a resting card shows
the painting and costs nothing (this replaced the old idle sway).

**One light.** Each scene has exactly one emitter, the street lantern. The
shader lights everything from it: inverse-square falloff, soft shadows with a
penumbra scaled to the emitter size, ambient occlusion, GGX specular, height
fog with closed-form single scattering (a wide isotropic term plus a tight
halo near the lamp), glossy reflections of the glow on wet stone and steel,
and a short reflection march for puddles and polished metal. A faint
non-directional ambient keeps shadows off pure black; it is not a light.
The lantern housing and bracket are skipped by shadow rays (they enclose the
light).

**Presets.** One preset object per scene: camera, street layout and seed,
arch depths, lamp-post and light position / colour / intensity, ambient,
exposure, fog, palette, figure and prop placement. The format is documented
at the top of `scene.js`.

| Member | Preset | Contents |
|---|---|---|
| @humblelifeskills | `humble-night-street` | An original Warden in blackened plate, mid-stride on wet cobbles, Oathsteel lowered in his right hand (ring pommel: the oath ring), red tabard with a gold pale and ring. Iron street lantern on a post, timber-framed houses, pointed arches receding into fog. |
| everyone else | `vigil-street` | The same street, empty, with the member's blade planted in the cobbles. Hash of the handle varies the houses, arch spacing and lamp side; the lantern is tinted by tier; the blade is toned by weapon. |

Add a bespoke scene by adding `PRESETS['@handle'] = { ... }`; it is merged
over the default, so it only needs the keys it changes.

**Masking.** The canvas sits in its own `.bf-win` leaf (arch radius +
`overflow:hidden`) on a plane at translateZ 2, just under the frame at 4. No
clipping is applied to an ancestor inside the 3D chain: `overflow`,
`clip-path` or `filter` on an ancestor flattens `preserve-3d`. Because the
depth now lives inside the scene, the CSS deck is thin (front planes z 0-10,
back planes z 3-10), so the card stays one solid slab at any spin angle and
the old "deck separates at steep spin" limit is gone.

**Fallback.** If WebGL or highp floats are unavailable, or the shader fails
to compile or link, the card renders the previous six-plane CSS/SVG scene
(far bg 0, near bg 9, leading lines 18, floor 27, character 36, foreground
43, fog 46, with the frame at 56). It is never blank. While the shader
compiles the window shows a painted CSS gradient, then the canvas fades in
(no fade under reduced motion).

**Figure hook (rigged model).** `BF_CARD.characterSlot()` returns the
`.bf-character` overlay on the window plane, above the canvas and clipped to
the arch. Put a canvas in it and the built-in SDF figure is removed from the
scene (and restored when the slot is emptied). `BF_CARD.scene().camera()`
returns the live off-axis camera in scene metres (`projection`, `view`:
column-major 4x4; `figure`: where the built-in figure stands), and the stage
fires `bf-pose` whenever the pose changes, so an external renderer can stay
registered with the street. The overlay has no shared depth with the scene,
so scene geometry cannot occlude it. In CSS-fallback mode the slot holds the
old placeholder and swaps as before. `BF_CARD.pose` is unchanged.

**Material.** The card body is deliberately translucent: `.bf-core` is `--mist`
at 70% with `backdrop-filter: blur(18px) saturate(1.35)`, the "dark liquid
glass" brief. Testing it against a bright flat colour will make correct
behaviour look broken. Over the window the tier foil is reduced to a faint
glaze, and the ascendant embers rise only through the bottom third, so the
painting keeps its contrast and never appears to move.
