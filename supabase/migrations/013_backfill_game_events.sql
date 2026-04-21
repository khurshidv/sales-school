-- Backfill game_events from completed_scenarios for players who played before
-- the analytics pipeline was fixed. Synthesizes day_started/day_completed
-- (+ one choice_made per stored choice) so the dashboard funnel reflects
-- historical activity.
--
-- Safe to run multiple times: we key synthesized events by a deterministic
-- source tag in event_data so re-runs become no-ops.

-- game_started for each player (one row per player, dated at first completion)
insert into public.game_events (player_id, event_type, event_data, scenario_id, day_id, created_at)
select
  cs.player_id,
  'game_started',
  jsonb_build_object('backfilled', true, 'source', 'completed_scenarios_backfill'),
  cs.scenario_id,
  null,
  min(cs.completed_at) - interval '1 second'
from public.completed_scenarios cs
where not exists (
  select 1 from public.game_events ge
  where ge.player_id = cs.player_id
    and ge.event_type = 'game_started'
)
group by cs.player_id, cs.scenario_id;

-- day_started — one per completed_scenarios row, 30s before completion
insert into public.game_events (player_id, event_type, event_data, scenario_id, day_id, created_at)
select
  cs.player_id,
  'day_started',
  jsonb_build_object('backfilled', true, 'source', 'completed_scenarios_backfill'),
  cs.scenario_id,
  cs.day_id,
  cs.completed_at - make_interval(secs => greatest(cs.time_taken, 30))
from public.completed_scenarios cs
where not exists (
  select 1 from public.game_events ge
  where ge.player_id = cs.player_id
    and ge.event_type = 'day_started'
    and ge.scenario_id = cs.scenario_id
    and ge.day_id = cs.day_id
);

-- day_completed — one per completed_scenarios row at completed_at
insert into public.game_events (player_id, event_type, event_data, scenario_id, day_id, created_at)
select
  cs.player_id,
  'day_completed',
  jsonb_build_object(
    'backfilled', true,
    'source', 'completed_scenarios_backfill',
    'score', cs.score,
    'rating', cs.rating,
    'time_taken', cs.time_taken
  ),
  cs.scenario_id,
  cs.day_id,
  cs.completed_at
from public.completed_scenarios cs
where not exists (
  select 1 from public.game_events ge
  where ge.player_id = cs.player_id
    and ge.event_type = 'day_completed'
    and ge.scenario_id = cs.scenario_id
    and ge.day_id = cs.day_id
);

-- choice_made — one per stored choice in cs.choices (jsonb array)
insert into public.game_events (player_id, event_type, event_data, scenario_id, day_id, created_at)
select
  cs.player_id,
  'choice_made',
  jsonb_build_object(
    'backfilled', true,
    'source', 'completed_scenarios_backfill',
    'node_id', choice->>'nodeId',
    'choice_index', (choice->>'choiceIndex')::int,
    'choice_id', choice->>'choiceId'
  ),
  cs.scenario_id,
  cs.day_id,
  cs.completed_at - make_interval(secs => greatest(cs.time_taken, 30) - (ord * 2))
from public.completed_scenarios cs,
     lateral jsonb_array_elements(cs.choices) with ordinality as t(choice, ord)
where jsonb_typeof(cs.choices) = 'array'
  and choice ? 'nodeId'
  and not exists (
    select 1 from public.game_events ge
    where ge.player_id = cs.player_id
      and ge.event_type = 'choice_made'
      and ge.scenario_id = cs.scenario_id
      and ge.day_id = cs.day_id
      and ge.event_data->>'node_id' = choice->>'nodeId'
      and (ge.event_data->>'backfilled')::boolean = true
  );

-- game_completed if player finished all 5 days of a scenario
insert into public.game_events (player_id, event_type, event_data, scenario_id, day_id, created_at)
select
  sub.player_id,
  'game_completed',
  jsonb_build_object(
    'backfilled', true,
    'source', 'completed_scenarios_backfill',
    'total_score', sub.total_score,
    'days_completed', sub.days
  ),
  sub.scenario_id,
  null,
  sub.last_completed
from (
  select
    cs.player_id,
    cs.scenario_id,
    count(distinct cs.day_id) as days,
    sum(cs.score) as total_score,
    max(cs.completed_at) as last_completed
  from public.completed_scenarios cs
  group by cs.player_id, cs.scenario_id
) sub
where sub.days >= 5
  and not exists (
    select 1 from public.game_events ge
    where ge.player_id = sub.player_id
      and ge.event_type = 'game_completed'
      and ge.scenario_id = sub.scenario_id
  );
