# Canvas (CNVS) — The Exhaustive Stream FAQ

> Everything Max (**[@MaxBladeTv](https://www.youtube.com/@MaxBladeTv)**) has answered on
> stream about his **Canvas** project, compiled from the live-stream transcripts in
> this repository.
>
> **Project:** Canvas, branded **CNVS** · domain **cnvs.dev**
> **Series:** "Vibe Coding Until I Buy My Family a House"
> **Coverage:** Day 30 (2026‑05‑27) → Day 45 (2026‑06‑17), plus three special streams
> **Compiled:** 2026‑06‑18 · Snapshot of streams transcribed as of that date

---

## How to read this document

- This FAQ is built **only** from what Max actually said on the transcribed streams.
  Where a clear quote exists it is shown in "quotation marks." Everything else is a
  faithful summary, not invention.
- Each answer cites the **Day / stream** it came from so you can trace it back to the
  transcript files in [`../transcripts/`](../transcripts/).
- Canvas was built **live and iteratively**, so some answers **changed over time**
  (especially pricing, the voice fallback model, and the Windows plan). Where that
  happened, the evolution is called out explicitly — the **latest** position is the
  one to trust.
- Caveat: transcripts are YouTube auto‑captions, so names are occasionally mangled
  ("CNVS" → "CNBS", "Groq" → "Grock", "Parakeet" → "parrakeet", "Fable" appears as a
  stand‑in for a top Anthropic model). These have been normalized here.

---

## TL;DR — what Canvas is in one paragraph

Canvas is a **voice‑controlled, infinite‑canvas agentic development environment** for
"vibe coding," built **natively in Swift for macOS**. On an infinite canvas you spawn
and orchestrate AI coding agents (Claude Code, Codex, Cursor, and others), open
terminals running dev servers, browser previews, a markdown/drawing surface
(Excalidraw‑style), a music player, and Max's own **Hermes** agent. Control is
**bidirectional** — you drive the agents by voice/text, and the agents can drive the
canvas back via a built‑in **MCP server + CLI**. Each canvas is one project directory;
canvases can run **remotely on your own VPS** so agents keep working after you close
your Mac. It shipped as a free members‑only **alpha** in late May 2026 and **launched
paid on Day 42 (2026‑06‑11)** as a **one‑time lifetime, bring‑your‑own‑key** purchase.

---

## Origin & timeline

| When | Milestone |
|------|-----------|
| ~2 weeks before Day 30 | Max starts building Canvas **off‑stream, at night, as a side project** ("a labor of love"). |
| Day 15 (≈2026‑05‑05) | He first **pitches the idea on stream**. Chat hates it — "the entire stream chat said it's a terrible idea and I made it anyways." |
| **Day 30 (2026‑05‑27)** | **First day Canvas is revealed and used live on stream.** Codenamed "Canvas." He decides he won't use any other tooling. |
| Day 30 | Viewer **Don** suggests **Parakeet** for local voice; Max wires it in same day and the app gets dramatically faster. Viewer **Elliot** proposes channel members get early access — Max adopts it. |
| Day 31 (2026‑05‑27) | Canvas declared "one of the main projects." Aurora chosen as the brand theme. |
| Day 33 (2026‑05‑29) | Max's birthday stream. Viewer **Don** gifts the **canvas.dev** domain and secures the **@canvas_dev** X handle. Plan set: ship **alpha to YouTube members by the weekend**. |
| Day 34 (2026‑06‑01) | 7.5‑hour stream focused on shipping the alpha (OAuth/access plumbing via Supabase). |
| Day 35 (2026‑06‑02) | Landing page + onboarding built; alpha "literally today/tomorrow." |
| Day 38 (2026‑06‑05) | **"Canvas is out in the public"** — early‑access alpha live to members, in‑app feedback flowing. |
| Day 39 (2026‑06‑08/09) | Canvas Link, Canvas Community, "smoked glass" blur saga (fixed via AVPlayerView), WWDC watch‑party. |
| Day 41 (2026‑06‑10) | Pre‑launch. 400+ on the waitlist. **"Pricing revealed tomorrow."** |
| **Day 42 (2026‑06‑11)** | **PAID LAUNCH.** Lifetime, one‑time, BYO‑key. Price ratchet starts at **$99**. ~$991 day‑one revenue. |
| Day 43 (2026‑06‑16) | ~$4,841 cumulative. Custom agent naming, Cobalt theme, keybinds. |
| Day 45 (2026‑06‑17) | ~$6,678–$7,000 in 6 days. Counter switches from "ARR" to "Earned." Release‑notes page, "Night Glass" 1.x. |

**Special streams (non‑numbered):**

| Date | Stream | Canvas relevance |
|------|--------|------------------|
| 2026‑05‑28 | "TESTING OPUS 4.8 ULTRACODE" | Early Canvas demo; remote canvas, recipes, Parakeet + Gemini fallback. |
| 2026‑06‑09 | "TESTING CLAUDE MYTHOS ALL DAY!" | Fable 5 / "Mythos" becomes primary model; native MCP registration refactor; monetization deliberation. |
| 2026‑06‑12 | "Not leaving my desk until I vibe code an entire windows app" | The **Windows‑port attempt** (Electron → rejected, Qt chosen). |

---

# THE FAQ

## 1. The basics

**Q: What is Canvas?**
A: "Our agentic development environment that lives inside an infinite canvas." It's a
voice‑controlled workspace where you spawn AI coding agents, open terminals, browser
previews, draw diagrams, and switch between projects — each canvas being one project
directory. Max variously calls it "the absolute forefront technology in voice‑driven
vibe coding," "the Disneyland of vibe coding," and "an ADHD delight / playground."
*(Days 30, 31, 33, 34, 35, 38, 41, 42, 43, 45; all special streams.)*

**Q: What's it called, and is "Canvas" the final name?**
A: Yes. It started as the codename "Canvas" ("because it's also a canvas") and he kept
it, dropping "codename." It is branded/stylized **CNVS** ("seenvs"), at **cnvs.dev**.
*(Days 30, 33; the canvas.dev domain was gifted Day 33, later presented as cnvs.dev.)*

**Q: Who built it and how long did it take?**
A: Max built it **solo, off‑stream, at night** over "a couple weeks" before revealing
it, then continued building it **live on stream**. "It's called Canvas. I built it
myself… a labor of love." *(Days 30, 34, 35; Stream 2026‑05‑28.)*

**Q: Whose idea was it? Did chat like it?**
A: His own. "We created Canvas from zero… I made it off stream and then pitched the
idea on the stream. The entire stream chat said it's a terrible idea and I made it
anyways." *(Day 41.)*

**Q: Why did you build it?**
A: To build a "sticky" app he'd reach for every day that solves his own pain — his
litmus test is that users would be *enraged* if it disappeared. *(Stream 2026‑05‑28.)*

---

## 2. Platform & tech — why Swift, why Mac‑only

**Q: What platform is it on? Is it Mac‑only?**
A: **macOS only**, and it's a native app you install — not an operating system, not
Linux (people repeatedly assume it's an OS because he runs it full‑screen). "It's a
Swift app on Mac OS that you install." *(Days 30, 31, 33, 34, 35, 38, 41, 42, 43, 45.)*

**Q: What's it built in?**
A: **100% Swift, from the ground up** — terminals, browser, canvas, music player, all
Swift. "There's no JavaScript here. This is Swift… running straight down to the single
chip… into the integrated memory." *(Days 30, 33, 34, 35, 38, 41, 42, 43, 45.)*

**Q: Why Swift and not Electron / a web app / Tauri?**
A: Performance and memory. JavaScript on the desktop is "so slow" and balloons RAM over
time; Swift "runs natively raw dog on Apple hardware" with native graphics, which he
needs for his ambition (many concurrent terminal agents, remote canvases). He's become
"anti‑Electron." A Mac app is "10 times more effort" than a web app — and that
difficulty is the **moat**: "Everybody can build a web app… a Mac app, it's different."
*(Days 30, 31, 34, 35, 38, 39, 41; Streams 2026‑05‑28, 2026‑06‑12.)*

**Q: Will there be a Windows / Linux version?**
A: Deferred, not promised on a date. He'd build it **natively** (C++/Rust/Qt) for real
performance — **never** Electron/JS as a shipped product. "If there's demand for it, I
will build the Windows version and the Linux version." On Day 42 he promised a Windows
build stream "tomorrow," which became the 2026‑06‑12 attempt (see §20). As of Day 45:
"we're a ways out from the Windows app coming out," likely with an early‑bird founder
price when it lands. *(Days 30, 33, 34, 38, 41, 42, 43, 45; Streams 2026‑05‑28,
2026‑06‑09, 2026‑06‑12.)*

**Q: Do I need a powerful Mac? What Mac do you use?**
A: He uses an **M5 / M5 Pro MacBook** (and an M1 Pro), but says it barely matters
anymore: Canvas uses very little memory/CPU thanks to Swift, so "any Mac… the shittiest
Mac Mini… would still be totally fine." (This is the whole point of *not* using
Electron.) *(Days 30, 33, 41, 45.)*

**Q: Is the drawing surface Excalidraw or a library?**
A: Custom‑built. "We built this from the ground up," *inspired* by Excalidraw, no
libraries. The **only** third‑party piece is an open‑source Swift terminal, heavily
customized. *(Days 39, 41.)*

**Q: Is the browser Chromium? Can it run Chrome extensions?**
A: No. Browser nodes are **Apple WebKit** web views — they can't run Chrome extensions,
and nothing (cookies/cache) is imported: "It's a fully vanilla plain… nothing
imported." Options considered for extension support (embed Chromium/CEF, a Chromium
fork, or puppeteering the user's real Chrome via CDP) were weighed and largely
rejected as too heavy. *(Days 39, 43.)*

---

## 3. Voice control

**Q: How does voice control work?**
A: Two modes:
1. **On‑device Parakeet (local).** NVIDIA's Parakeet model does local speech‑to‑text,
   then a homegrown grammar/regex + confidence scorer fires commands directly. Fast,
   deterministic, free, no API calls (~0.3s). Downside: you must use fairly precise
   commands.
2. **GPT Realtime 2 (conversational).** A real LLM — "be as sloppy as you want," feels
   like Jarvis, always understands, can include a prompt in the same breath. Downside:
   slower and costs money (**bring‑your‑own OpenAI key**).
*(Days 30, 31, 34, 35, 38, 41, 42, 43, 45; all special streams.)*

**Q: What happens when local Parakeet isn't confident?**
A: It escalates the transcript to a cheap LLM to resolve the command into JSON. The
**fallback model changed over time**: originally **Gemini 2.5 Flash**, later **Groq**
("Grock with a Q," running GPT‑OSS‑20B) for speed. During the free alpha the fallback
was **disabled** (so unrecognized commands simply fail and copy to clipboard); Max
planned to re‑enable a fallback before paid so users never feel they must repeat
themselves. *(Days 30, 31, 38, 39, 42; Streams 2026‑05‑28, 2026‑06‑09.)*

**Q: Is it fully local / does it require internet?**
A: Not fully local — only the Parakeet text path is. "Other than fuzzy‑lookup failure
LLM calls… it's not local." He won't *require* a local LLM ("then nobody would use the
app") but added a settings option to use a local model (Gemma via Ollama) for those who
want it. The alpha needs internet at launch to validate the invite code / alpha status.
*(Days 31, 38, 41.)*

**Q: Is there a wake word?**
A: Yes ("computer" / "Canvas, wake up"), plus address‑by‑name (e.g., "Marshall, do
this"), but Max prefers **push‑to‑talk** for control; the wake word "doesn't work that
good yet." *(Days 30, 34.)*

**Q: Will voice work in other languages (German, Spanish)?**
A: "I don't know… I hope so." Parakeet's TDT variant supports ~25 European languages;
a viewer confirmed Spanish working live. *(Stream 2026‑05‑28.)*

**Q: Does it have plain dictation like Whisper Flow?**
A: Yes — added a separate **Whisper‑Flow‑style dictation** keybind (e.g., right‑option)
distinct from the command/canvas voice key (left‑option). It types wherever your cursor
is and doesn't auto‑submit. Max canceled his Whisper Flow subscription after building
it: "instant, raw, highly performant." *(Day 45.)*

---

## 4. Agents & orchestration

**Q: Which agents/CLIs does it support?**
A: "It works with anything. Any agent installed on your computer." Demonstrated: Claude
Code, Codex, Cursor (Composer), OpenCode, Gemini CLI, Grok, Kimi, DeepSeek, plus Max's
own **Hermes** and **Open Claw**. He's "model agnostic." *(Days 34, 38, 41; all special
streams.)*

**Q: Are all those chat windows individual agents? Can one agent control others?**
A: Yes — each is an individual agent, and an agent can **spawn and prompt other agents**
(e.g., one Claude writing a plan, then spawning 4–30 Codex agents to execute). *(Days
34, 35, 38, 41.)*

**Q: How are agents named?**
A: They **auto‑name themselves** on spawn, by default after the **Paw Patrol** cast
(his kid's favorite show) — Chase, Marshall, Sky, Rubble, Rocky, Zuma, Everest,
Tracker, Rex, Liberty, Ryder. You can also name them yourself ("open a Claude Code
agent named Thanos"). **Day 43** added a custom naming setting (comma‑separated pool,
round‑robin with numbered suffixes; agents can set the pool via MCP/CLI). No multiple
built‑in name packs, for copyright reasons. *(Days 30, 33, 34, 43.)*

**Q: How do the agents know they can control the canvas?**
A: Via a built‑in **Canvas MCP server + CLI**. This was a major architecture problem he
solved live: originally Canvas injected a big bootstrap prompt into every agent on open
(slow, token‑heavy, unreliable, "crude prompt injection"). A later refactor set up
**native MCP registration at launch** + standing instruction files (CLAUDE.md, a Codex
skill, Cursor rules), so agents have CLI/MCP knowledge from turn zero with no injected
prompt. On install, Canvas reads your shell config (`.zshrc`), detects your installed
agents, and can open them with the correct per‑agent "skip permissions" flag. *(Days
31, 34, 38; Streams 2026‑05‑28, 2026‑06‑09.)*

**Q: Why both an MCP *and* a CLI?**
A: "I need both." The MCP is "a help desk that agents can show up at" for instructions
even if they don't fully know the CLI; the combination is best‑case coverage. *(Stream
2026‑06‑09.)*

**Q: What is the Forge?**
A: A bidirectional **Kanban board node**. Load it with tasks (agents can add tasks too),
set max concurrent agents (e.g., 20–30), hit start, and it spawns/prompts agents that
move through ready → building → testing → done and then **auto‑close** to keep the
canvas clean. "It absolutely rips" for burning through a feedback backlog. *(Days 38,
39, 42; Stream 2026‑06‑12.)*

**Q: How do you stop agents fighting over the same files (race conditions)?**
A: Max says he's "never once" hit it, even with 20 agents — agents detect another agent
editing a file and wait (a "watcher on the file"), helped by the shared canvas memory.
The "proper" way is **git worktrees**, which you can run inside Canvas; he doesn't
bother because he assigns agents to separate parts of the codebase. *(Days 39, 42, 43;
Stream 2026‑06‑12.)*

**Q: What's the tangible benefit of many agents vs. one?**
A: **Speed** — big models (Fable 5) can take 5–30 min per turn; without parallel agents
you sit idle. Caveat: don't let parallelism degrade quality — QA each agent. *(Stream
2026‑06‑12.)*

**Q: How many agents/terminals can it handle?**
A: "I don't think there's a max… comes down to how good your computer is." He's demoed
15 Claude + 15 Codex + 15 Cursor at once. Spinning up ~100 at once could still
crash/freeze it live; getting perf good enough to spin up ~1,000 took ~2 months of work.
*(Days 34, 38; Stream 2026‑06‑12.)*

**Q: How does the canvas show agent status?**
A: Color states — green glow = done / needs input, strobing orange = working — using
Claude/Codex completion + permission **hooks** where available; without hooks it watches
the PTY for ~2s of silence. Each agent type has a distinct "firework" color (Codex blue,
Claude orange, Cursor pink). Press **F** to flip all agent cards and see each one's last
prompt. *(Days 30, 33.)*

**Q: Can I make a custom agent with its own personality?**
A: Not really what Canvas is optimized for — "that's more of a Hermes / Open Claw
thing." You can edit `claude.md` / `agent.md` so an agent reads a persona, but Canvas is
tuned for "getting psychotic and shipping," not personas. *(Day 41.)*

**Q: What is "caveman mode"?**
A: A toggle (Settings → Agents) forcing agents to give "ultra‑brief, zero‑jargon
replies" — good for shipping fast, bad for hard debugging. Built in but not used much
live yet. *(Days 39, 42, 45.)*

---

## 5. Memory system

**Q: Is there shared memory across agents?**
A: Yes — a **system‑wide canvas memory** all agents read/write via MCP/CLI, so
different‑brand agents (Cursor/Codex/Claude) feel like "one agent" and you stop
re‑explaining context ("200% less me explaining"). *(Days 38, 39; Streams 2026‑06‑09,
2026‑06‑12.)*

**Q: How is the memory implemented?**
A: After deep research (he rejected heavyweight engines like Mem0/MemOS as wrong at this
scale, citing **just‑in‑time retrieval / RAG** — ~26% higher accuracy, ~90% fewer
tokens), he chose a **file‑based "MD playbook"**: short/medium/long‑term notes,
canvas‑prioritized plus a global pool, pulled on demand rather than injected. *(Day
38.)*

**Q: Does every agent honor it?**
A: Mostly. **Claude** sometimes defaults to its own memory system and has to be told
"commit this to memory"; an early cross‑agent test failed because Claude Code saved to
its own store, which is why he considered a dedicated **Canvas skill** to route memory.
*(Days 38, 39.)*

---

## 6. Remote canvases (VPS)

**Q: What is a remote canvas?**
A: A canvas that **runs on your own VPS** (e.g., Hetzner) via SSH/Tailscale. Agents
started there keep running **after you close or turn off your Mac**; reopen the same
remote canvas from any Mac and they're still going. Max calls remote canvases "one of
the main reasons I made Canvas." *(Days 30, 33, 38, 39, 41, 43; all special streams.)*

**Q: Does that cost *you* (Max) compute? Are my SSH keys shared with you?**
A: "There's going to be zero compute on my end." Remote canvases are only for users with
their **own** VPS; Canvas reads your existing SSH credentials/alias and ports you into
your server view — no keys are handled by or shared with Max. *(Stream 2026‑05‑28.)*

**Q: What do I need for it to work?**
A: The agent CLI (e.g., Codex/Claude Code) must be installed **on the server**, and you
connect via SSH/Tailscale. A viewer connected their Tailscale dev box in ~5 minutes.
*(Days 33, 43.)*

**Q: What is Canvas Link?**
A: A feature to **link two canvases** (e.g., front end + back end, or local +
production) so agents in either side have cross‑context and — if you permit it — can
edit both. One directed edge, two permission levels (reference/read‑only by default;
edit is deliberate). Invoked via Command‑K. Ships phase‑1 as local + reference‑only; it
was briefly disabled because he thought no one would use it. *(Days 39, 41.)*

---

## 7. Themes, UI & the "smoked glass" saga

**Q: What themes are there?**
A: Many, evolving constantly — Daybreak, Foolscape, Bauhaus, **Aurora** (his original
favorite and the brand direction), Outrun, Meadow / Night Meadow, Arcadian, Bitmap,
Graphite, Miami, Highlighter, **Lakeside** (light + night, very popular), **Cobalt** (a
paid blue noisy‑gradient with full "liquid glass"), Hyperdrive, plus a "Materials
series" of release names (Night Glass, Iron Bloom, Ghost Line, Silver Wake). Backgrounds
are made by Max: GPT Image Gen 2 stills animated into 4K loops with **Kling**. Goal: a
translucent "smoked glass" look. Future: user‑customizable themes + a theme marketplace.
*(Days 30, 31, 33, 34, 38, 39, 41, 42, 43, 45.)*

**Q: How did you get the UI so polished?**
A: A lot of iteration on an 85" 8K TV, plus Anthropic's Claude **front‑end design
skill** ("amazing for anti‑slop"); typically Claude builds + prettifies, then Codex
passes through for performance. *(Day 30.)*

**Q: What was the "smoked glass / blur" problem?**
A: A multi‑day saga (Day 39): the translucent glass nodes couldn't blur the animated
lake background because that background is a separately‑composited AV player surface the
backdrop filter can't sample. Apple "Liquid Glass" wouldn't fix it (same limitation).
A Discord member ("Slater/Coleman") DM'd the fix at 3:30am: switch **AVPlayerLayer →
AVPlayerView**, after which "totally native blur works perfectly." *(Days 39, 41.)*

**Q: Is performance laggy?**
A: It got a "10x increase in animation performance" after fixing a bug that redrew every
element every frame. "Swift was the right move." *(Day 41.)*

---

## 8. Models used & cost (Max's own setup)

**Q: What models/plans do you use to build Canvas?**
A: Mainly **Claude (Opus)** on the **$200/mo** plan, plus a **$100/mo Codex** plan and
**$20/mo Cursor**. The model story evolved on stream:
- **Opus 4.8** (heavy use late May): great for beautiful UIs; he found it underwhelming
  for landing‑page generation ("nowhere near a generational leap… feels like 4.7.1").
- **GPT‑5.5**: "still the goat" for clean, bug‑free backend code; also runs his Hermes
  agent.
- **Fable 5 / "Mythos"** (released ~2026‑06‑09): became his primary model — "the most
  unbelievable model," a "large generational leap," one‑shotting backend bugs that 4.8
  and 5.5 failed at across ~100 prompts. **But** "no design taste at all" and no better
  at strategic planning — taste/direction stays with the human.
- **Composer 2.5 (Cursor)**: the fast/cheap model for quick UI tweaks.
By Day 45 he reported Opus 4.8 had "deteriorated," he was on GPT‑5.5 extra‑high, and
Fable 5 had been temporarily pulled.
*(Days 33, 34, 38, 39, 41, 43, 45; Streams 2026‑06‑09, 2026‑06‑12.)*

**Q: Do you mix models (e.g., Claude's MCP with Codex)?**
A: "I absolutely do that" — mixing yields better output. *(Day 33.)*

**Q: What about "Ultra Code"?**
A: Anthropic's high‑token/effort mode. It burns enormous tokens (a hero‑section landing
page = "another million to two million"); he suspects it's tuned more for commercial use
and benchmark‑chasing than for indie hackers, and once wasted ~1.5M tokens running it on
the wrong model. *(Day 33.)*

**Q: What about local / open‑source models for the coding itself?**
A: "They're just not there yet" for his complexity. You *can* point Canvas at a local
model (Ollama → Gemma/Qwen) but he wouldn't run it live (eats all system memory). He's
interested in native local‑model support eventually. *(Days 39, 41.)*

**Q: How much do you spend?**
A: "$200 a month" on Claude (he upgraded from $100 mid‑series because Fable 5 "eats
tokens like crazy" — burned a $100 plan in ~2 prompts). *(Days 39, 41; Stream
2026‑06‑09.)*

---

## 9. Music player, backgrounds & media

**Q: What's the music player for / where are the backgrounds from?**
A: It's a visualizer/equalizer to vibe‑code to. Backgrounds are his own (GPT Image Gen
2 + Kling, 4K loops). The player persists across all canvases. *(Days 39, 42, 45.)*

**Q: Does it support Spotify / Apple Music / YouTube?**
A: It has **Apple Music** (via MusicKit, auto‑syncs), **YouTube**, and built‑in licensed
"stations" (lo‑fi/ambient). **Spotify** is the top‑requested feature but hard: the old
streaming SDK was deprecated; only the "app remote" SDK remains (a remote control that
doesn't play audio itself), so it'd be the first real library added to Canvas. YouTube
audio is fought by bot‑protection/PO‑token and DRM blocks the audio tap. Telemetry shows
almost nobody uses the music player. *(Days 38, 43, 45; Stream 2026‑06‑09.)*

**Q: Why wouldn't the app open at one point (MusicKit)?**
A: Adding the Apple **MusicKit** entitlement conflicted with the enterprise provisioning
profile, so launchd refused to spawn the notarized app — he had to re‑enable the
entitlement in Apple's developer portal. *(Day 39.)*

---

## 10. Drawing, diagrams & "loops"

**Q: Can agents draw on the canvas / make diagrams?**
A: Yes, and it's being deepened. Agents reaching the canvas via the control plane can
already label/box/annotate/screenshot real draw elements; full coordinate‑controlled
"draw me a diagram" is built via a `canvas draw elements` JSON verb (demoed a 54‑element
diagram). The roadmap goal is visual **loops**: draw a loop node (sticky note +
countdown ring), wire an arrow to a target agent/forge, and "start the loop" — making
Canvas the "first looping‑native" agentic platform. *(Days 41, 45; Stream 2026‑06‑09.)*

**Q: Can I draw with a tablet/drawing pad?**
A: "We're going to figure that out" — a friend gifted him a drawing pad for it. *(Stream
2026‑06‑12.)*

**Q: Can I focus/label areas by voice?**
A: Yes — label a drawn box (e.g., "goals") and say "focus on goals" to zoom to it. "One
of my favorite new features." *(Day 31.)*

---

## 11. Other features (recipes, keybinds, nodes, simulator, screenshots)

**Q: What are "recipes"?**
A: Save a canvas layout — agents, terminals with their commands, browser preview,
positions — and "boot recipe" to restore your exact per‑project setup instantly. *(Days
33, 39, 41; Stream 2026‑05‑28.)*

**Q: What keybinds exist?**
A: Added Command‑L (reorganize), Command‑1/2/3 (focus), Command‑W (close), Command‑D
(duplicate terminal), plus Ghostty‑style terminal keybinds; "game changer." *(Days 41,
43.)*

**Q: Can I add custom "nodes"?**
A: Everything is a node (terminal, browser, music, etc.) and "theoretically we could
build a node of anything and the AI can control the node." He's floated a node
marketplace (community‑built, paid add‑ons, with virus checking) and VS Code–like
extensibility. *(Days 30, 34, 38.)*

**Q: Can it open the iOS simulator?**
A: It's hard and only partially built (behind a debug flag). macOS forbids reparenting
another process's window, so the approach is to **mirror** Simulator.app
(ScreenCaptureKit) and forward input — "puppeteering." It was pulled from the build
until it's perfected. *(Days 30, 42.)*

**Q: Can it open other Mac apps / a Finder / Discord inside the canvas?**
A: No — deliberately. "An application built for everything is an application built for
nothing." You can drag files onto the canvas and hand them to agents, but adding general
apps drifts toward "building an operating system," which he's avoiding for now. *(Days
38, 42.)*

**Q: Does it have a code/markdown viewer?**
A: It shipped a Swift **markdown editor**; a minimal **Sublime/Limelight‑style** code
editor node is planned for the rare times you want to read code. Canvas is built for
vibe coding, not manual editing. *(Days 39, 45.)*

**Q: Does it do screenshot‑based iteration?**
A: Yes — a built‑in screenshot feature (via MCP/CLI) lets an agent open a canvas,
screenshot it, see the output, and iterate — a visual feedback flywheel. *(Stream
2026‑06‑12.)*

**Q: Can I drag‑and‑drop images?**
A: Yes — drop auto‑imports images onto the canvas, and you can then hand an image to a
selected agent (Claude/Codex), or drop it directly into a terminal. *(Days 33, 41.)*

**Q: Can agents stop hijacking my view/focus?**
A: Day 45 added a settings toggle ("Allow agents to move the canvas/focus," **off by
default**) covering explicit view/focus/switch. One *implicit* case remains (when a
background agent on another canvas spawns a node, the view still switches so the node can
mount). *(Days 33, 45.)*

---

## 12. Hermes & Open Claw integration

**Q: Will your own agents (Hermes / Open Claw) live in Canvas?**
A: Yes — **Hermes is built in natively** as an iMessage‑style chat node (over
SSH/Tailscale). Nuance: the *natively built* Hermes node "is a closed garden" and can't
control the canvas, whereas the **CLI version can fully control the canvas**. Hermes runs
on **GPT‑5.5**. *(Days 30, 33, 38, 39.)*

**Q: Is Canvas replacing Hermes?**
A: No — they're complementary. **Hermes** handles infrastructure and bulk work (SSH to
the VPS, repos, Node/Mongo/PM2, Supabase invite codes, buying domains/SSL/DNS, sending
60 access codes). **Canvas** is for taste‑driven work (design, UX, landing pages).
Analogy: "Claude Code is holding the paintbrush; Hermes is a paintbrush holding another
paintbrush." *(Days 38, 43; Stream 2026‑06‑09.)*

---

## 13. Release, alpha & access

**Q: When did the alpha ship and who got it?**
A: Free **early‑access alpha** to **YouTube channel members** ("green in your
username"), shipped around Day 34–35 and confirmed live by **Day 38** ("Canvas is out in
the public"). ~120 people / 60+ invite codes; members had to give feedback; access was
time‑limited with a hard cut‑off when it went paid. He also hand‑picked some recipients
and gave away invite codes live. *(Days 30, 31, 33, 34, 35, 38; Stream 2026‑06‑09.)*

**Q: How does access/gating work technically?**
A: Sign in with **Google or Apple OAuth via Supabase**; the app phones home on launch to
check access + version against a Supabase allow‑list / one‑time invite codes, and forces
an update if your build is old. There's a kill switch / per‑user revocation. *(Days 34,
35.)*

**Q: How do I get on it now?**
A: Get on the early‑access list at **cnvs.dev**; you'll either get early access or be
emailed when it's public. By Day 41 there were 400+ on the waitlist (grown from ~50 over
a weekend via X). *(Days 38, 41; Stream 2026‑06‑09.)*

---

## 14. Pricing & licensing

> **This is the answer that changed the most.** Early on Max refused to name a price and
> even leaned toward a subscription. The **final, shipped** model (Day 42 onward) is
> below.

**Q: Will it cost money?**
A: Always yes — "I sell everything I make." But for a long time he refused to state a
number: "if anybody asks me how much it costs, I'm going to lose my mind." *(Days 30,
31, 33; Stream 2026‑05‑28.)*

**Q: Subscription or one‑time?**
A: **Final answer: one‑time lifetime license, bring‑your‑own‑key, NO subscription.**
"Charging recurring revenue for a product currently with no recurring costs is a bad
look." (Mid‑series, on the 2026‑06‑09 stream, he had leaned toward a subscription that
absorbs the cheap voice fallback — that idea was dropped.) *(Days 42, 45; Stream
2026‑06‑12.)*

**Q: What's the price?**
A: A **price ratchet** that goes up as licenses sell. It launched at **$99** (first 5
buyers), then **$129**, stepping to **$169** after the next ~44. Buyers get a **numbered
license** and **all 1.x updates forever**. Plan: retire the lifetime option around
~150–200 licenses, then switch to monthly‑sub for new users — **existing lifetime buyers
grandfathered**. *(Days 42, 45.)*

**Q: What does "all 1.x updates forever — do I pay for 2.x?" mean?**
A: It's protective wording so the lifetime promise isn't "boxed in": if something huge
and genuinely costly ships later, he could offer it as an **optional** paid add‑on
without breaking the lifetime deal. Purely theoretical for now. *(Day 45.)*

**Q: Is there a free trial?**
A: No. "Free trials are for venture capitalists, not for indie makers." Adding a free
trial previously hurt his QuickClaw growth. *(Day 42.)*

**Q: Does the license cover all my devices?**
A: Yes — one account; log in with the same Apple/Google account on all your devices.
*(Day 42.)*

**Q: Will Windows buyers get a founder price?**
A: Yes, an early‑bird/founder price is planned for the Windows version when it ships.
*(Days 42, 45; Stream 2026‑06‑12.)*

---

## 15. Costs to run it (for users)

**Q: Does Canvas bill me API rates? Can I use my Claude/Codex subscription?**
A: **You use your existing subscriptions, not API billing.** The agent CLIs (Claude
Code, Codex, Cursor) run off your normal plans — "no API usage being billed," full
subsidized usage (e.g., the $200 plan's 20x). The **only** bring‑your‑own‑API‑key part
is **voice via GPT Realtime**; the local Parakeet voice path makes no API calls at all.
Max calls this one of the two most under‑appreciated features. *(Days 42, 45; Stream
2026‑06‑09.)*

**Q: So what's the marginal cost per user to you?**
A: Effectively **zero** — users bring their own keys/subs, and Parakeet runs on‑device.
*(Streams 2026‑06‑09, 2026‑06‑12.)*

---

## 16. Business, revenue & strategy

**Q: How much has Canvas made?**
A: ~**$991** day‑one (Day 42), ~**$4,841** by Day 43, ~**$6,678–$7,000** by Day 45 (6
days). The stream counter switched from "ARR" to **"Earned"** on Day 45 because ARR
(from his other apps) was confusing and falling; "Earned" is total made over 45 days from
vibe‑coded apps (excludes X/YouTube payouts). *(Days 42, 43, 45.)*

**Q: Where do buyers come from?**
A: Many are viewers, but the majority come from **X posts** (each video ~100k views).
Revenue/visitor ~$6.26; conversion ~4.6–4.75% ("highest I've ever had, by 2–2.5x"). Goal:
$10k from the app this month. *(Day 45.)*

**Q: What was your revenue before Canvas?**
A: ~$10k MRR from prior apps — **QuickClaw, Talk Macros, Feel Better Fast**, plus
**Clippo** — which is where the series' early "ARR" number came from (not Canvas). *(Day
34; Stream 2026‑06‑09.)*

**Q: Aren't you just copying Bridgemind? Can't people copy you?**
A: Anyone can rebuild it, but the moats are the themes/animations/features, the back‑end
community, "and the biggest moat… I'm the guy live‑streaming it." On Bridgemind
specifically: "totally different… it just seems a little too boxed in for me" (he dislikes
the menu‑left + grid‑of‑terminals layout). Bridgemind's Matt was actually a "massive
inspiration" to return to streaming. *(Days 42, 43; Streams 2026‑05‑28, 2026‑06‑12.)*

**Q: Will you raise VC money?**
A: Leans **bootstrap first** — prove revenue, then maybe raise to hire marketing/dev.
Skeptical what VC buys beyond hiring and ad dollars. *(Day 31.)*

**Q: Will you hire a team / let the community build the Windows port?**
A: Hesitant — "I hate working with others" — but the community ("Bladefam army") might
make a dev team worth it. *(Day 45.)*

**Q: Is it a ship‑and‑forget product?**
A: No — "Canvas is not going anywhere… a continually supported product," his own daily
dev environment, with **~1–3 updates per week**. *(Stream 2026‑06‑12.)*

---

## 17. Building Canvas inside Canvas (dev workflow)

**Q: Do you build Canvas *with* Canvas?**
A: Yes. "I build canvas within canvas." A `scripts/dev-app.sh` opens **canvas‑dev** — a
second instance on its own port/canvases — so the installed app stays up while he tests
new features. *(Days 34, 35; Streams 2026‑06‑09, 2026‑06‑12.)*

**Q: Doesn't that cause more bugs, and how does an agent "see" a Swift app (no
Playwright)?**
A: "Not really." He built a test harness: a locally‑built **artifact** exposes an API
controller so the main canvas drives the artifact — moving around, screenshotting,
running ~1,000+ tests — a feedback loop that replaces Playwright for Swift. *(Day 39;
Stream 2026‑06‑09.)*

**Q: Why do macOS permission prompts keep popping up?**
A: Because he **rebuilds** the Swift app every change, macOS re‑asks for mic/voice
permissions each time; a normally‑installed copy wouldn't. *(Days 31, 33.)*

---

## 18. Roadmap & community features

**Q: What is Canvas Community?**
A: A planned **opt‑in social canvas**: floating avatars of opted‑in users; click to
expand a "MySpace‑style" profile card with avatar, username, away/status message, a
project link, a numbered‑license badge, a "now playing" song, and telemetry (tokens
used, preferred model, agents per session). Built dormant/feature‑flagged for launch;
could later allow sharing/trading themes, nodes, or skills. *(Days 39, 42; Streams
2026‑06‑09, 2026‑06‑12.)*

**Q: Will there be shared / multiplayer canvases?**
A: Envisioned but out of V1 scope — "the first Google Docs shared vibe‑coding experience
ever," with two people prompting agents together and seeing each other's cursors/output.
*(Day 41; Stream 2026‑05‑28.)*

**Q: A mobile / iPad companion?**
A: Wanted a lot — "An iPad and iPhone version of this is going to be insane." Envisioned
as a phone remote (push‑to‑talk, swipe to flip canvases) for hands‑free coding in front
of a TV. An iOS alpha was mentioned as starting "that week." Built natively in Swift (not
React Native). No firm date. *(Days 31, 39; Stream 2026‑06‑09.)*

**Q: Can I use it on a TV?**
A: Yes — a favorite use case: stand in front of a TV, fully voice‑controlled, no
keyboard/mouse. *(Streams 2026‑05‑28, 2026‑06‑12.)*

**Q: Will there be release notes / a changelog?**
A: Yes — **cnvs.dev/release**, curated and minimal. First release framed as **"Canvas
1.0 Night Glass"** (current build 1.3.2), with a "Materials series" naming scheme. *(Day
45.)*

**Q: Did WWDC change anything for Canvas?**
A: Per Hermes' summary, Apple announced things that *touch* Canvas (a Language Model
Executor API, on‑device multimodal, dynamic model swapping, free private cloud compute
for small‑business‑program apps, a first‑party CLI, Xcode 27 agentic coding) — but his
conclusion was "almost nothing new to actually add." *(Day 39.)*

---

## 19. Backend / infrastructure choices

**Q: Why Supabase? Any regrets?**
A: He chose **Supabase** for OAuth + version control + **private storage buckets** for
installer downloads (dropping public GitHub releases) because it was lowest‑complexity
and has a CLI/MCP agents can drive. But he **regrets** it for this project — Postgres /
row‑level‑security friction "makes everything so much more difficult"; he prefers
self‑hosted **MongoDB + Node + vanilla React on a VPS** (all JavaScript he learned
pre‑AI). *(Days 34, 35, 41.)*

**Q: What's the rest of the infra?**
A: MongoDB/Node/PM2 on a **Hetzner** VPS, **Cloudflare** DNS/email, Supabase for invite
codes, image gen via GPT Image Gen 2, video via Kling. *(Days 41, 43; Stream
2026‑06‑12.)*

**Q: How will updates be delivered?**
A: Originally considered **GitHub releases**, then switched to **Supabase private
buckets**; the app compares its local build version against a releases table on launch
and forces an update if old. *(Days 34, 35.)*

---

## 20. The Windows‑port saga (Stream 2026‑06‑12)

**Q: Did you ship a Windows version?**
A: **No production Windows release.** He spent the stream attempting it 100% via vibe
coding, transforming the Swift app.

**Q: What stack did you try?**
A: Fable 5 recommended **Electron** (the only stack with a battle‑tested embedded
terminal + browser + fast canvas, à la VS Code). He built a working Electron Windows/Linux
version and **rejected it** — it "feels like a knockoff / a web page." **Tauri** was ruled
out (Linux webview canvas perf is a documented disaster). **Flutter** was rejected (no
mature embedded terminal). He ended committing to a **Qt (C++/QML) rebuild**, with
**Rust** (Alacritty terminal, Zed's GPUI) as the bold alternative, driving Fable 5 on a
Claude Code `/goal` loop to mirror the Swift app feature‑for‑feature from git history.
The Qt prototype "immediately feels like a real app." *(Stream 2026‑06‑12.)*

**Q: Do I need a developer subscription / code signing for Windows?**
A: No subscription to build, but unsigned apps trigger SmartScreen ("Windows protected
your PC"). Traditional code signing is ~$215–$550/yr (Azure artifact signing ~$9.99/mo);
open‑sourcing can yield free signing. *(Stream 2026‑06‑12.)*

---

## Appendix: facts that changed over the series

| Topic | Early position | Latest position |
|-------|----------------|-----------------|
| **Pricing model** | Refused to name a price; leaned toward a subscription (2026‑06‑09) | **One‑time lifetime, BYO‑key, no subscription** (Day 42+) |
| **Launch price** | Unknown / "revealed tomorrow" (Day 41) | **$99 → $129 → $169** ratchet; numbered licenses (Day 42) |
| **Voice fallback model** | Gemini 2.5 Flash | **Groq** (GPT‑OSS‑20B); disabled during free alpha | 
| **Primary model** | Opus 4.8 | **Fable 5 / "Mythos"** when available, else GPT‑5.5 |
| **Windows** | "Maybe, native, someday" | Attempted live; **Qt rebuild chosen**, still unshipped |
| **Domain/name** | Codename "Canvas" | **CNVS · cnvs.dev** (canvas.dev gifted Day 33) |
| **Updates delivery** | GitHub releases | **Supabase private buckets** |

---

*Compiled from the transcripts in [`../transcripts/`](../transcripts/). Quotes are from
YouTube auto‑captions and lightly cleaned for readability; line references live in the
per‑stream `.md` / `.json` files.*
