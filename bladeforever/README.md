# Blade Forever — groundwork

A chatter-statistics site for MaxBladeTv: rankings, collectible member cards,
growth, goals and earnings, in a medieval dark-fantasy treatment.

**Blade Forever is not hivecoding.gg.** hivecoding.gg is a separate, already-live
site that runs the chat prompt engine. Blade Forever is a *consumer* of data:

| source | gives us |
|---|---|
| **hivecoding.gg** | chat prompt-engine stats (suggestions, scores, what got used) |
| **old site** | historical stats from the previous version |
| **YouTube chat replay** | per-message chat history, avatars, badges, Super Chats |
| **transcripts** (this repo) | goals, earnings timeline |

Those merge into one ranking and one card per member.

Status: **prep / spike.** Nothing is provisioned. This directory holds the
schema, the ingestion script, the AI contracts, and the cost model.

---

## 1. Can we get the top 20 chatters' profile pictures? — **Yes. Verified today.**

Proven end to end on the real channel (2026-10-21):

- **Source:** Apify actor `coregent/youtube-live-chat-scraper` in **replay**
  mode. This matters — YouTube's official Data API *cannot* read the chat of an
  ended stream (`liveChatMessages` works only while a broadcast is live).
  Replay mode reads the full chat of a finished stream.
- **Test run:** latest replay — *"building the hivecoding platform with opus
  5.5"* (`al0kXm7r3Kk`). Pulled 1,500 chat events = the first 3.6 hours.
- **Result:** **154 unique chatters, 100% with an avatar URL.**

Per chatter we get everything a card needs:

| field | use on the card |
|---|---|
| `authorChannelId` | stable identity (names/avatars change, this doesn't) |
| `authorPhotoUrl` | the card portrait |
| `authorName` / `authorHandle` | card name |
| `isMember` / `isModerator` / `isOwner` / `isVerified` | badge sources |
| `authorBadges` | `MEMBER`, `MODERATOR`, `OWNER`, `VERIFIED` observed |
| `superChatAmountValue` + currency | Patron/Benefactor badges, rarity |
| `videoOffsetMsec` | timing badges (First Light, Night Owl, Marathoner) |
| `messageText` | feeds the prompt-suggestion filter |

### Two caveats that need your action

1. **Avatars arrive at 32×32.** Every URL ends `=s32-c-k-...`. Rewriting that to
   `=s512-` is the standard googleusercontent trick and `fetch_chat.py` does it
   automatically — **but I could not verify it**, because the avatar CDN
   (`yt4.ggpht.com`) is blocked from this sandbox. *Please open one upscaled URL
   in a browser to confirm before we build on it.* If it doesn't work we need a
   channel-profile lookup per member instead (more calls, still fine).
2. **`@nightbot` is in the top 20** (rank 8, 42 messages). Bots must be excluded
   from cards — handled by `chatters.is_bot`, seeded with a name-pattern check.

### Top 20 from the test window

Sampled from the first 3.6h only, so this is **not** the final ranking — it
biases toward early chatters. Real ranks need the full chat.

```
 1 @humblelifeskills 107  (mod, member)   11 @rieefq            33
 2 @TheZarion007      85                  12 @BrandynMakes      33  (mod, member)
 3 @shmloney          84                  13 @sumwhat1275       29  (member)
 4 @byanuragbaral     65                  14 @Choso-r6f         28
 5 @AppsCreative      56                  15 @Zincツ             28
 6 @Sam-Amodei        48                  16 @adrianpadurariu   27  (member)
 7 @davidkang5708     45  (mod)           17 @RobbieHyatt       24
 8 @nightbot          42  (BOT — exclude) 18 @IAMYOURFATHER…    23
 9 @Ackk53            40                  19 @argofowl          21
10 @chrislink73       34                  20 @iamdonh           19  (mod)
```

---

## 2. Cost model (the one real constraint)

The chat actor bills **$0.001 per chat event**. Measured rate on this channel:
**~420 events/hour**, so a typical 3.5-hour stream is ~1,500 events.

| job | events | cost |
|---|---|---|
| today's test | 1,500 | **$1.51** (actually billed) |
| one full stream | ~1,500–2,500 | ~$1.50–2.50 |
| full history backfill (~103+ streams) | ~175,000 | **~$175** |
| each new stream going forward | ~2,000 | ~$2 |
| Super-Chat-only pass (monetization) | ~tens | pennies |

**Free alternative for the backfill:** the open-source `chat-downloader`
(Python) reads the same replay chat directly for $0 — but youtube.com is blocked
from this sandbox, so it has to run **on your machine**. Recommendation:
`chat-downloader` locally for the one-time backfill, Apify for the ongoing
per-stream ingest (it already works from here, unattended).

`fetch_chat.py --max-total N` is the spend ceiling; `--dry-run` prints the
payload and the implied maximum charge before anything bills.

---

## 3. What's here

```
hivecoding/
  db/schema.sql        core tables: streams, chatters, chat_events,
                       chatter_stream_stats, prompt_suggestions, badges,
                       chatter_badges, cards, stream_goals, earnings_points
  db/seed_badges.sql   17 badges with machine-checkable `criteria` JSON
  db/rarity.sql        chatter_rarity view — rarity is DERIVED, not hand-set
  ingest/fetch_chat.py Apify replay ingestion (validated; --dry-run works)
  ai/prompts.md        three AI contracts (see below)
```

**Design decisions baked in**

- `chat_events` is append-only raw truth keyed on YouTube's own `message_id`,
  so re-ingesting a stream is idempotent — no duplicate messages ever.
- Rollups (`chatter_stream_stats`, `chatter_totals`, `chatter_rarity`) are
  derived and recomputable from scratch. Ranks can't drift or be fudged.
- Rarity blends **rank** (top 1 = mythic, top 3 = legendary, top 10 = epic) with
  **absolute thresholds** (10k messages, $100 in Super Chats, membership), so
  the top stays scarce *and* a committed newcomer can still earn a good card.
- `chatters.opted_out` — a real person can ask to be removed and the views
  exclude them. Worth having from day one, since cards feature real accounts.

**The three AI jobs** (`ai/prompts.md`): the prompt-suggestion filter, the card
blurb, and the card art prompt. The blurb spec encodes your rule as a hard
constraint — **positive only, no exceptions, no roast mode** — with a banned-word
and sentiment post-check that regenerates, then falls back to a safe template.
It also bars commentary on appearance or anything inferable from an avatar, and
bars unfavourable comparisons between members.

---

## 4. Card visuals

For the holographic/foil tilt effect, the well-known approach is the CSS
technique behind `simeydotme/pokemon-cards-css` (MIT) — layered conic/radial
gradients, `background-blend-mode`, and a pointer-driven 3D transform. **Use the
technique, not the content:** original frames and original AI art only, no
existing card game's characters, logos, frames, or mascots, and no real person's
likeness as generated art. The member's actual avatar sits in its own portrait
frame; the generated art is an abstract emblem backdrop (see `ai/prompts.md`).

Effects ladder: `holo` → `foil` → `glitch` → `ember` → `prismatic` → `aurora`.

---

## 5. What I need from you

1. **Verify the 512px avatar URL** in a browser (I can't — CDN blocked here).
2. **Pick the backfill path:** `chat-downloader` locally (free) or Apify (~$175).
3. **Approve a Supabase project** — then I apply `schema.sql` + seeds. You have
   Supabase connected; I deliberately did not provision anything.
4. **Pick the art model** for card backdrops (you have Higgsfield connected).
5. **Point hivecoding.gg at a Vercel project** when you want it deployed.

Open questions I did not decide for you: whether cards are opt-in or opt-out;
whether the leaderboard is all-time, rolling-90-day, or both; and whether
Super Chat amounts are shown publicly on cards or only used for rarity.
