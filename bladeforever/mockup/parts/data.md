# data.js — Blade Forever dataset

`window.BF_DATA = { members, meta, ranked(), bots(), byHandle(h), isReal(field, member?), validate(), setChannelIds(map), mergeHive(rows) }`

Plain script, no DOM, no fetch, no `Math.random`. All placeholder values come from a mulberry32 PRNG seeded by FNV-1a of `handle|salt`, so the dataset is identical on every load.

## Shape

Exactly the CONTRACT section 2 object, plus additive fields: `channelId` (join key, currently `null`), `isBot`, `isMod`, `isMember`, and `real` on each badge. Tier keys are `ascendant|exalted|honored|tempered|footman` (contract spelling).

`members` holds 19 humans (rank 1-19, in message order) followed by `@nightbot`. Use `BF_DATA.ranked()` for the ledger and cards. The bot has `isBot:true`, `wouldRank:8`, and `rank/tier/level/title/cls/weapon` all `null` so the UI can show it being filtered. Its other fields are zeroed, never undefined. Ties keep the supplied order (33: rieefq 10, BrandynMakes 11; 28: Choso 13, Zinc 14).

`history[].day` = days since 2026-05-01 (day 0); the last possible day is 173 (2026-10-21). Entries are strictly chronological and sum exactly to `chat.messages`.

## Derivations

| Field | Rule |
|---|---|
| tier | rank 1-5 / 6-10 / 11-25 / 26-100 / 101+ |
| level | `min(60, floor(1 + 5.2*sqrt(messages)))` (107 -> 54) |
| MIG | `min(99, round(98*sqrt(messages/107)))` |
| INS | `min(99, round(16*sqrt(hive.used)))` - from `hive.used` only |
| VIG | `min(99, round(1.8*chat.streams))` |
| RES | `min(99, round(5*months + 3.5*streak))` |
| cls | Warden (mod) > Artificer (used >= 3) > Oathsworn (member) > Chronicler (>= 80 msgs) > Journeyman (>= 40) > Wanderer |
| weapon | months 0 Notched Iron; 1-2 Footman's Sword; 3-5 Oathsteel; 6-11 Emberbrand; 12+ Bladeforever |
| title | ranks 1-5 have their own; then per tier (Captain / Knight of the Hall / Sergeant / Footman) |
| acceptRate | `used / suggestions`, 2 dp |

`derive(m)` recomputes all of these from raw inputs, so a merge re-derives cleanly.

Placeholder coupling: streams scale with messages; streak grows with months; `isMember <=> months > 0`; personality: mods +22 supportive, members +10, technical rises with INS, curious with suggestions, persistent with streak and months.

## Real vs placeholder

REAL: handle, name, initials, isBot/isMod/isMember, rank, tier, title, level, `stats.MIG`, `chat.messages`.

PLACEHOLDER: channelId, VIG, INS, RES, personality, all of `hive`, streams, firstSeen, lastSeen, streak, superchatTotal, months, history, non-real badges.

Conditional (use `BF_DATA.isReal(field, member)`): `cls` is real only for Warden (Artificer is checked next and depends on placeholder `used`) or after hive merge; `weapon` and `chat.months` are real only for non-members (0 / Notched Iron). Without a member argument `isReal` is conservative. `meta.provenance` lists everything with the pending source. The UI should badge any field where `isReal` is false.

Note: `chat.messages` is the first-3.6h sample of one stream until backfill; the placeholder streams/history spread it across the ledger.

## validate()

Returns `{ok, checks, failures}` and logs failures. Asserts: shape completeness; messages equal the real counts; contiguous ranks; tier/level/MIG formulas; INS derived from `hive.used`; Artificer iff used >= 3 (after Warden); used <= suggestions; acceptRate; VIG derived from streams (r > 0.95); RES derived from months and streak (both correlate); streak <= streams; `months:0` <=> non-member <=> Notched Iron; history sums, chronology, <= streams, endpoints equal first/lastSeen; mods skew supportive; technical correlates with INS; bot excluded; no placeholder badged real; determinism. Currently 1376 checks, 0 failures.

## Merging hivecoding.gg

hivecoding.gg exports per-member: suggestions made, used, accept rate, best score, top category.

**Join key: YouTube channel id (`UC...`), never display name or handle** (names change). Fill `channelId` first from the chat payload (`authorChannelId`) via `BF_DATA.setChannelIds({handle: id})`, then call `BF_DATA.mergeHive(rows)` with `[{channelId, suggestions, used, bestScore, topCategory}]`.

- Matched: `hive` is replaced, `acceptRate` recomputed from used/suggestions (the feed's own rate is ignored to avoid drift), INS/class/Prompt Smith badge re-derived, member flagged real.
- Blade Forever only: hive zeros become real (they never prompted); the card keeps working.
- hivecoding.gg only: no card is minted (no chat identity); returned in `report.hiveOnly`.
- No `channelId` yet: left as placeholder, listed in `report.unjoinable`.

Returns `{matched, bfOnly, hiveOnly, unjoinable}`.
