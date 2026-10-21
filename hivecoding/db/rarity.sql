-- hivecoding.gg — card rarity is DERIVED, so the ladder can't be gamed or
-- hand-edited. Recompute after every ingest.
--
-- The rule: rarity is the highest tier the chatter qualifies for, by either
-- their rank on the ladder or an absolute threshold. Rank matters so the top of
-- the board always feels scarce; thresholds matter so a newcomer who goes hard
-- can still earn a good card.

create or replace view chatter_rarity as
with ranked as (
  select
    channel_id, handle, display_name, avatar_url,
    total_messages, total_superchat, streams_attended,
    ever_member, ever_moderator,
    row_number() over (order by total_messages desc) as msg_rank
  from chatter_totals
)
select
  r.*,
  case
    when r.msg_rank = 1                                    then 'mythic'
    when r.msg_rank <= 3   or r.total_messages >= 10000     then 'legendary'
    when r.msg_rank <= 10  or r.total_superchat >= 100      then 'epic'
    when r.msg_rank <= 50  or r.total_messages >= 1000
                           or r.ever_member                 then 'rare'
    else                                                         'common'
  end as rarity,
  -- the flashiest effect the chatter has earned via a badge wins; falls back to
  -- a rarity-appropriate default.
  coalesce(
    (select b.effect from chatter_badges cb
       join badges b on b.slug = cb.badge_slug
      where cb.channel_id = r.channel_id and b.effect is not null
      order by array_position(
        array['aurora','prismatic','ember','glitch','foil','holo'], b.effect)
      limit 1),
    case when r.msg_rank <= 10 then 'holo' else null end
  ) as effect
from ranked r;
