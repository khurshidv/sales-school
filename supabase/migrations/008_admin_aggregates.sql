-- Phase 1: RPC functions for dashboard 2.0 aggregates.
-- These are created now (Phase 1) so Phase 2 UI tasks don't block on DB work.
-- All functions are STABLE (no writes) and SECURITY DEFINER (run as owner).

-- -----------------------------------------------------------------------------
-- get_branch_flow: Sankey-shaped data for a (scenario, day, date range).
-- Returns rows of (from_node, to_node, count) computed from consecutive
-- node_entered events within each player's session.
-- -----------------------------------------------------------------------------
create or replace function public.get_branch_flow(
  p_scenario_id text,
  p_day_id text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (from_node text, to_node text, flow_count bigint)
language sql
stable
security definer
as $$
  with entries as (
    select
      player_id,
      (event_data->>'node_id') as node_id,
      created_at,
      lead(event_data->>'node_id') over (partition by player_id order by created_at) as next_node
    from public.game_events
    where event_type = 'node_entered'
      and scenario_id = p_scenario_id
      and day_id = p_day_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
  )
  select node_id as from_node, next_node as to_node, count(*)::bigint as flow_count
  from entries
  where next_node is not null
  group by node_id, next_node
  order by flow_count desc;
$$;

-- -----------------------------------------------------------------------------
-- get_node_stats: per-node stats — visits, avg thinking time, exits.
-- -----------------------------------------------------------------------------
create or replace function public.get_node_stats(
  p_scenario_id text,
  p_day_id text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  node_id text,
  entered_count bigint,
  avg_thinking_time_ms numeric,
  exit_count bigint
)
language sql
stable
security definer
as $$
  with entered as (
    select (event_data->>'node_id') as node_id, count(*)::bigint as c
    from public.game_events
    where event_type = 'node_entered'
      and scenario_id = p_scenario_id and day_id = p_day_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  ),
  thinking as (
    select
      (event_data->>'node_id') as node_id,
      avg((event_data->>'thinking_time_ms')::numeric) as avg_t
    from public.game_events
    where event_type = 'choice_made'
      and scenario_id = p_scenario_id and day_id = p_day_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  ),
  exited as (
    select (event_data->>'node_id') as node_id, count(*)::bigint as c
    from public.game_events
    where event_type = 'node_exited'
      and scenario_id = p_scenario_id and day_id = p_day_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  )
  select
    coalesce(e.node_id, t.node_id, x.node_id) as node_id,
    coalesce(e.c, 0) as entered_count,
    coalesce(t.avg_t, 0) as avg_thinking_time_ms,
    coalesce(x.c, 0) as exit_count
  from entered e
  full outer join thinking t on t.node_id = e.node_id
  full outer join exited x on x.node_id = coalesce(e.node_id, t.node_id)
  order by entered_count desc;
$$;

-- -----------------------------------------------------------------------------
-- get_dropoff_zones: nodes where players close the tab most often.
-- Drop-off = player's LAST node_entered in the session with no subsequent
-- node_exited or day_completed within the session.
-- -----------------------------------------------------------------------------
create or replace function public.get_dropoff_zones(
  p_scenario_id text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (node_id text, day_id text, dropoff_count bigint)
language sql
stable
security definer
as $$
  with last_node as (
    select distinct on (player_id, day_id)
      player_id,
      day_id,
      (event_data->>'node_id') as node_id,
      created_at
    from public.game_events
    where event_type = 'node_entered'
      and scenario_id = p_scenario_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    order by player_id, day_id, created_at desc
  ),
  completed as (
    select distinct player_id, day_id
    from public.game_events
    where event_type in ('day_completed', 'day_failed')
      and scenario_id = p_scenario_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
  )
  select l.node_id, l.day_id, count(*)::bigint as dropoff_count
  from last_node l
  left join completed c on c.player_id = l.player_id and c.day_id = l.day_id
  where c.player_id is null
  group by l.node_id, l.day_id
  order by dropoff_count desc
  limit 50;
$$;

-- -----------------------------------------------------------------------------
-- get_engagement_index: composite interest score for a scenario.
-- Returns a json blob with sub-metrics; Phase 2 UI computes the 0-10 index.
-- -----------------------------------------------------------------------------
create or replace function public.get_engagement_index(
  p_scenario_id text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns json
language sql
stable
security definer
as $$
  select json_build_object(
    'completion_rate', (
      select
        case when count(distinct case when event_type = 'day_started' then player_id end) = 0 then 0
        else count(distinct case when event_type = 'day_completed' then player_id end)::numeric
             / count(distinct case when event_type = 'day_started' then player_id end)::numeric
        end
      from public.game_events
      where scenario_id = p_scenario_id
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    ),
    'avg_thinking_time_ms', (
      select avg((event_data->>'thinking_time_ms')::numeric)
      from public.game_events
      where event_type = 'choice_made'
        and scenario_id = p_scenario_id
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    ),
    'replay_rate', (
      select
        case when count(distinct player_id) = 0 then 0
        else (count(*)::numeric - count(distinct (player_id, day_id))::numeric)
             / count(distinct player_id)::numeric
        end
      from public.completed_scenarios
      where scenario_id = p_scenario_id
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    )
  );
$$;

-- -----------------------------------------------------------------------------
-- get_player_journey: full timeline for a single player.
-- -----------------------------------------------------------------------------
create or replace function public.get_player_journey(p_player_id uuid)
returns table (
  event_type text,
  event_data jsonb,
  scenario_id text,
  day_id text,
  created_at timestamptz
)
language sql
stable
security definer
as $$
  select event_type, event_data, scenario_id, day_id, created_at
  from public.game_events
  where player_id = p_player_id
  order by created_at asc
  limit 5000;
$$;

-- -----------------------------------------------------------------------------
-- get_offer_funnel: conversion funnel for the post-game offer page.
-- -----------------------------------------------------------------------------
create or replace function public.get_offer_funnel(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns json
language sql
stable
security definer
as $$
  select json_build_object(
    'game_completed', (
      select count(distinct player_id)
      from public.game_events
      where event_type = 'game_completed'
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    ),
    'offer_view', (
      select count(distinct session_id)
      from public.offer_events
      where event_type = 'offer_view'
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    ),
    'offer_cta_click', (
      select count(distinct session_id)
      from public.offer_events
      where event_type = 'offer_cta_click'
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    ),
    'offer_conversion', (
      select count(distinct session_id)
      from public.offer_events
      where event_type = 'offer_conversion'
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    )
  );
$$;
