-- hivecoding.gg — core schema (Postgres / Supabase)
-- Design notes:
--   * chat_events is append-only raw truth; everything else is derived.
--   * channel_id (YouTube authorChannelId) is the stable identity key — display
--     names and avatars change, channel ids do not.
--   * Rarity and badges are COMPUTED from stats, never hand-set, so the ladder
--     stays honest as the chat grows.

-- ───────────────────────────────── streams ─────────────────────────────────
create table if not exists streams (
  video_id            text primary key,
  title               text not null,
  url                 text not null,
  published_at        timestamptz,
  stream_started_at   timestamptz,
  duration_seconds    integer,
  day_number          integer,              -- parsed "Day 46"
  arr_usd             integer,              -- early-era titles: "( $20,154 ARR )"
  earned_usd          integer,              -- current-era titles: "( Earned : $44,037 )"
  chat_event_count    integer not null default 0,
  chat_ingest_status  text not null default 'pending'
                      check (chat_ingest_status in ('pending','partial','complete','no_chat')),
  transcript_words    integer,
  ingested_at         timestamptz
);
create index if not exists streams_published_idx on streams (published_at desc);
create index if not exists streams_day_idx       on streams (day_number);

-- ──────────────────────────────── chatters ─────────────────────────────────
create table if not exists chatters (
  channel_id        text primary key,       -- authorChannelId — stable
  handle            text,                   -- "@humblelifeskills"
  display_name      text,
  avatar_url        text,                   -- stored normalized to =s512-
  avatar_cached_url text,                   -- our own copy (ggpht URLs rotate)
  avatar_updated_at timestamptz,
  first_seen_at     timestamptz,
  last_seen_at      timestamptz,
  is_bot            boolean not null default false,  -- nightbot & friends
  opted_out         boolean not null default false,  -- honour removal requests
  created_at        timestamptz not null default now()
);
create index if not exists chatters_handle_idx on chatters (lower(handle));

-- ────────────────────────────── chat events ────────────────────────────────
create table if not exists chat_events (
  message_id         text primary key,      -- YouTube's id = natural dedupe key
  video_id           text not null references streams(video_id) on delete cascade,
  channel_id         text references chatters(channel_id) on delete set null,
  event_type         text not null,         -- message|superchat|membership|system
  posted_at          timestamptz,
  video_offset_ms    bigint,                -- ms into the stream
  message_text       text,
  superchat_value    numeric(12,2),
  superchat_currency text,
  is_member          boolean default false,
  is_moderator       boolean default false,
  is_owner           boolean default false,
  is_verified        boolean default false,
  badges             text[] default '{}',
  ingested_at        timestamptz not null default now()
);
create index if not exists chat_events_video_idx   on chat_events (video_id);
create index if not exists chat_events_chatter_idx on chat_events (channel_id);
create index if not exists chat_events_offset_idx  on chat_events (video_id, video_offset_ms);

-- ─────────────────────── per-chatter per-stream rollup ─────────────────────
create table if not exists chatter_stream_stats (
  channel_id       text not null references chatters(channel_id) on delete cascade,
  video_id         text not null references streams(video_id) on delete cascade,
  messages         integer not null default 0,
  superchat_total  numeric(12,2) not null default 0,
  first_offset_ms  bigint,
  last_offset_ms   bigint,
  was_member       boolean not null default false,
  was_moderator    boolean not null default false,
  primary key (channel_id, video_id)
);

-- ──────────────────────── lifetime totals (the ladder) ─────────────────────
create materialized view if not exists chatter_totals as
select
  c.channel_id,
  c.handle,
  c.display_name,
  c.avatar_url,
  count(distinct s.video_id)                        as streams_attended,
  coalesce(sum(s.messages), 0)                      as total_messages,
  coalesce(sum(s.superchat_total), 0)               as total_superchat,
  bool_or(s.was_member)                             as ever_member,
  bool_or(s.was_moderator)                          as ever_moderator,
  min(st.published_at)                              as first_stream_at,
  max(st.published_at)                              as last_stream_at,
  max(st.day_number)                                as latest_day_seen,
  min(st.day_number)                                as earliest_day_seen
from chatters c
left join chatter_stream_stats s on s.channel_id = c.channel_id
left join streams st             on st.video_id  = s.video_id
where not c.is_bot and not c.opted_out
group by c.channel_id, c.handle, c.display_name, c.avatar_url;
create unique index if not exists chatter_totals_pk on chatter_totals (channel_id);

-- ─────────────────── prompt suggestions (AI-filtered chat) ─────────────────
create table if not exists prompt_suggestions (
  id             bigserial primary key,
  message_id     text unique references chat_events(message_id) on delete cascade,
  channel_id     text references chatters(channel_id) on delete set null,
  video_id       text references streams(video_id) on delete cascade,
  raw_text       text not null,
  ai_score       numeric(4,3),             -- 0.000–1.000 usefulness
  ai_category    text,                     -- feature|bug|design|refactor|idea|question
  ai_rewritten   text,                     -- cleaned, ready-to-paste prompt
  ai_reasoning   text,
  ai_model       text,
  status         text not null default 'new'
                 check (status in ('new','shortlisted','used','rejected')),
  used_at        timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists prompt_sugg_rank_idx on prompt_suggestions (status, ai_score desc);

-- ──────────────────────────── badges & awards ──────────────────────────────
create table if not exists badges (
  slug        text primary key,
  name        text not null,
  description text not null,
  rarity      text not null check (rarity in ('common','rare','epic','legendary','mythic')),
  effect      text,                         -- holo|foil|prismatic|ember|glitch|aurora
  icon        text,
  criteria    jsonb not null                -- machine-checkable rule (see seed_badges.sql)
);
create table if not exists chatter_badges (
  channel_id text not null references chatters(channel_id) on delete cascade,
  badge_slug text not null references badges(slug) on delete cascade,
  awarded_at timestamptz not null default now(),
  video_id   text references streams(video_id) on delete set null,
  primary key (channel_id, badge_slug)
);

-- ───────────────────────────────── cards ───────────────────────────────────
create table if not exists cards (
  channel_id      text primary key references chatters(channel_id) on delete cascade,
  rarity          text not null,
  effect          text,
  art_url         text,
  art_prompt      text,
  art_model       text,
  blurb           text,                     -- the positive-only AI write-up
  stats_snapshot  jsonb,                    -- frozen stats shown on the card face
  embed_slug      text unique,              -- /embed/<slug>
  version         integer not null default 1,
  generated_at    timestamptz,
  updated_at      timestamptz not null default now()
);

-- ─────────────────── goals & money timelines (from transcripts) ────────────
create table if not exists stream_goals (
  id          bigserial primary key,
  video_id    text references streams(video_id) on delete cascade,
  goal_text   text not null,
  status      text not null default 'stated'
              check (status in ('stated','in_progress','done','abandoned')),
  source      text not null default 'transcript',
  offset_ms   bigint,
  created_at  timestamptz not null default now()
);

create table if not exists earnings_points (
  id         bigserial primary key,
  video_id   text references streams(video_id) on delete cascade,
  observed_at timestamptz not null,
  metric     text not null check (metric in ('arr','earned')),
  amount_usd numeric(12,2) not null,
  source     text not null default 'title',
  unique (video_id, metric)
);
