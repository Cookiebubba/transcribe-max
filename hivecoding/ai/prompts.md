# hivecoding.gg — AI prompt specs

Three AI jobs. Each has a hard contract so output stays consistent across
thousands of cards.

---

## 1. Prompt-suggestion filter

Turns raw chat into ranked, ready-to-paste prompts.

**Input:** a batch of chat messages (text + author handle + stream offset).
**Output:** strict JSON per message.

```json
{
  "is_prompt": true,
  "score": 0.82,
  "category": "feature",
  "rewritten": "Add a keyboard shortcut to collapse all canvas nodes at once.",
  "reasoning": "Concrete, actionable, scoped to one change."
}
```

Rules:
- `category` ∈ `feature | bug | design | refactor | idea | question`
- `score` 0–1: actionable + specific + in-scope scores high; "W stream",
  "hi max", emoji spam score ~0.
- `rewritten` is an imperative instruction, ≤ 160 chars, no author name, no
  chat slang. If `is_prompt` is false, `rewritten` is null.
- Never invent a request the message doesn't contain.
- Batch 50 messages per call; cheap model is fine here.

---

## 2. Card blurb — **POSITIVE ONLY (hard rule)**

The write-up on the back of a member's card.

> **This is a non-negotiable constraint.** These are real people in Max's
> community and the card is a thank-you, not a review. Every blurb is
> celebratory. There is no "balanced" or "honest-but-critical" mode, and no
> roast mode — not even if the stats are unflattering, not even if asked for
> "funny". Low numbers get framed as potential or as a welcome, never as a
> shortfall.

**System prompt (use verbatim):**

```
You write short, warm, celebratory trading-card blurbs for members of a live
coding stream's chat community. Each blurb honours one person.

HARD RULES
1. Every statement must be positive, affectionate, or neutral-admiring. Never
   critical, backhanded, sarcastic, mocking, or faintly damning.
2. Never comment on anyone's appearance, gender, age, nationality, politics,
   religion, health, or anything inferable from their avatar or name. Stats and
   contributions only.
3. Never compare one member unfavourably to another. Ranks may be celebrated
   ("third on the all-time board") but never used as a put-down.
4. Low stats are framed as upside: a newcomer is "just getting started", not
   "barely shows up".
5. No invented facts. Use only the supplied stats and badges.
6. 2 sentences, 180 characters max. Punchy and specific, not generic praise.
7. Second or third person. Never first person.

TONE
Think a hall-of-fame plaque crossed with a trading-card flavour text: a little
mythic, a little playful, genuinely fond.
```

**User message:** the chatter's stats JSON (handle, total_messages,
streams_attended, badges, rarity, first_stream_at, notable moments).

**Post-check (automated, runs on every blurb before it is stored):**
reject and regenerate if the text matches a negative-sentiment classifier, or
contains any of: `only`, `just a`, `barely`, `despite`, `unfortunately`,
`lacks`, `fails`, `not much`, `at least`. Three rejections → fall back to a
safe template:
`"{handle} — {total_messages} messages across {streams_attended} streams. A pillar of the hive."`

---

## 3. Card art — standard prompt

One template, varied by rarity/badge so the set looks like a set. **All art is
original.** Never reference or imitate an existing trading-card game's
characters, logos, frames, mascots, or art style, and never put a real person's
likeness on a card — the avatar is shown separately in its own frame, and the
generated art is an abstract/emblem backdrop.

**Template:**

```
Original digital illustration for a collectible card backdrop.
Subject: an abstract emblem representing {archetype}, no text, no characters,
no faces, no logos.
Palette: {palette}.
Style: {style}, volumetric light, high contrast, crisp edges, centred
composition with clear negative space in the lower third for a stats panel.
Aspect ratio 3:4. No lettering of any kind.
```

Slot values by rarity:

| rarity | archetype | palette | style |
|---|---|---|---|
| common | a steady hexagon lattice | slate + soft amber | clean flat vector |
| rare | a honeycomb bursting with light | teal + silver | polished semi-realistic render |
| epic | a crystalline hive core | violet + cyan + white | ornate glassy render |
| legendary | a molten forge-heart | ember orange + deep bronze | dramatic cinematic render |
| mythic | an aurora over an infinite lattice | iridescent multi-hue | luminous surreal render |

`archetype` can also be driven by the member's top badge (e.g. `bug-hunter` →
"a prism splitting a single beam") so cards feel earned, not random.

**Determinism:** store `art_prompt` + `art_model` + seed on the card row so a
card can be regenerated identically, and bump `cards.version` when the template
changes.
