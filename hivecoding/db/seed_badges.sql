-- hivecoding.gg — badge catalogue.
-- `criteria` is machine-checkable so awards can be recomputed from scratch at
-- any time (idempotent). The award job reads these rules, never hard-coded SQL.
--
-- rarity ladder: common < rare < epic < legendary < mythic
-- effect: the visual treatment applied to the card (see cards.effect)

insert into badges (slug, name, description, rarity, effect, icon, criteria) values

-- ── tenure ────────────────────────────────────────────────────────────────
('day-one',      'Day One',        'Was in chat during the first three days of the run.',          'legendary','prismatic','sunrise',
   '{"type":"attended_day_lte","value":3}'),
('og-hundred',   'OG Hundred',     'Among the first 100 people ever to post in chat.',             'epic',     'foil',     'seedling',
   '{"type":"first_n_chatters","value":100}'),
('the-regular',  'The Regular',    'Showed up for 25 or more streams.',                            'epic',     'holo',     'armchair',
   '{"type":"streams_attended_gte","value":25}'),
('iron-streak',  'Iron Streak',    'Seven streams in a row without missing one.',                  'legendary','ember',    'flame',
   '{"type":"consecutive_streams_gte","value":7}'),

-- ── volume ────────────────────────────────────────────────────────────────
('century',      'Century',        'Posted 100 messages.',                                         'common',   null,       'hundred',
   '{"type":"total_messages_gte","value":100}'),
('millennium',   'Millennium',     'Posted 1,000 messages.',                                       'rare',     'holo',     'tower',
   '{"type":"total_messages_gte","value":1000}'),
('ten-k-club',   'Ten-K Club',     'Posted 10,000 messages. Genuinely remarkable.',                'mythic',   'aurora',   'galaxy',
   '{"type":"total_messages_gte","value":10000}'),

-- ── timing ────────────────────────────────────────────────────────────────
('first-light',  'First Light',    'Sent the first message of a stream, five times or more.',       'epic',     'foil',     'rooster',
   '{"type":"first_message_of_stream_count_gte","value":5}'),
('night-owl',    'Night Owl',      'Still in chat four hours into a stream.',                       'rare',     'holo',     'moon',
   '{"type":"max_offset_hours_gte","value":4}'),
('marathoner',   'Marathoner',     'Present from the first hour to the last of one stream.',        'epic',     'holo',     'ribbon',
   '{"type":"full_stream_span","value":0.9}'),

-- ── contribution ──────────────────────────────────────────────────────────
('prompt-smith', 'Prompt Smith',   'Had 5 prompt suggestions actually used on stream.',            'legendary','prismatic','anvil',
   '{"type":"prompts_used_gte","value":5}'),
('idea-spark',   'Idea Spark',     'Had a prompt suggestion used on stream.',                      'rare',     'holo',     'spark',
   '{"type":"prompts_used_gte","value":1}'),
('bug-hunter',   'Bug Hunter',     'Three accepted suggestions categorised as bug reports.',       'epic',     'glitch',   'magnifier',
   '{"type":"prompts_used_in_category_gte","category":"bug","value":3}'),

-- ── standing ──────────────────────────────────────────────────────────────
('mod-squad',    'Mod Squad',      'Trusted with the mod badge.',                                  'legendary','ember',    'shield',
   '{"type":"ever_moderator"}'),
('member',       'Member',         'Supported the channel with a membership.',                     'rare',     'foil',     'star',
   '{"type":"ever_member"}'),
('patron',       'Patron',         'Sent a Super Chat.',                                           'epic',     'foil',     'gem',
   '{"type":"total_superchat_gte","value":0.01}'),
('benefactor',   'Benefactor',     'Sent over $100 in Super Chats.',                               'mythic',   'aurora',   'crown',
   '{"type":"total_superchat_gte","value":100}')

on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  rarity      = excluded.rarity,
  effect      = excluded.effect,
  icon        = excluded.icon,
  criteria    = excluded.criteria;
