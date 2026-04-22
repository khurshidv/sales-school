-- 026_retention_rpc.sql
-- D1 / D7 retention: players who returned to the game N days after first game_started.

create or replace function public.get_retention(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  cohort_date date,
  cohort_size bigint,
  d1_returned bigint,
  d7_returned bigint
)
language sql stable security definer
as $$
  with first_start as (
    select player_id, min(created_at)::date as start_date, min(created_at) as start_at
    from public.game_events
    where event_type = 'game_started'
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by player_id
  ),
  d1 as (
    select distinct f.player_id
    from first_start f
    join public.game_events e
      on e.player_id = f.player_id
     and e.created_at >= f.start_at + interval '1 day'
     and e.created_at <  f.start_at + interval '2 day'
  ),
  d7 as (
    select distinct f.player_id
    from first_start f
    join public.game_events e
      on e.player_id = f.player_id
     and e.created_at >= f.start_at + interval '7 day'
     and e.created_at <  f.start_at + interval '8 day'
  )
  select
    f.start_date as cohort_date,
    count(*)::bigint as cohort_size,
    count(d1.player_id)::bigint as d1_returned,
    count(d7.player_id)::bigint as d7_returned
  from first_start f
  left join d1 on d1.player_id = f.player_id
  left join d7 on d7.player_id = f.player_id
  group by f.start_date
  order by f.start_date desc;
$$;
