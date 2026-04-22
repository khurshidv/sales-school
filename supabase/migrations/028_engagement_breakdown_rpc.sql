-- 028_engagement_breakdown_rpc.sql
-- Thinking-time percentiles (p50/p90/p95) + daily trend for composite Interest Index inputs.
-- NOTE: language is not tracked anywhere on game_events right now. Added as a parameter hook
-- for future use when tracking lands, but doesn't filter today.

create or replace function public.get_thinking_percentiles(
  p_scenario_id text,
  p_day_id text default null,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  p50_ms numeric,
  p90_ms numeric,
  p95_ms numeric,
  sample_size bigint
)
language sql stable security definer
as $$
  select
    percentile_cont(0.5)  within group (order by (event_data->>'thinking_time_ms')::numeric) as p50_ms,
    percentile_cont(0.9)  within group (order by (event_data->>'thinking_time_ms')::numeric) as p90_ms,
    percentile_cont(0.95) within group (order by (event_data->>'thinking_time_ms')::numeric) as p95_ms,
    count(*)::bigint as sample_size
  from public.game_events
  where event_type = 'choice_made'
    and scenario_id = p_scenario_id
    and (p_day_id is null or day_id = p_day_id)
    and (p_from is null or created_at >= p_from)
    and (p_to is null or created_at <= p_to)
    and (event_data->>'thinking_time_ms') is not null;
$$;

create or replace function public.get_engagement_trend(
  p_scenario_id text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  bucket_date date,
  started bigint,
  completed bigint,
  avg_thinking_ms numeric,
  completion_rate numeric
)
language sql stable security definer
as $$
  select
    created_at::date as bucket_date,
    count(distinct player_id) filter (where event_type = 'day_started')::bigint as started,
    count(distinct player_id) filter (where event_type = 'day_completed')::bigint as completed,
    avg((event_data->>'thinking_time_ms')::numeric) filter (where event_type = 'choice_made') as avg_thinking_ms,
    case
      when count(distinct player_id) filter (where event_type = 'day_started') > 0
      then count(distinct player_id) filter (where event_type = 'day_completed')::numeric
         / count(distinct player_id) filter (where event_type = 'day_started')
      else 0
    end as completion_rate
  from public.game_events
  where scenario_id = p_scenario_id
    and (p_from is null or created_at >= p_from)
    and (p_to is null or created_at <= p_to)
  group by 1
  order by 1;
$$;
