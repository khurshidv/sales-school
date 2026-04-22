-- 027_dropoff_rate_rpc.sql
-- Drop-off with the denominator (node visits). dropoff_rate = dropoff_count / entered_count.
-- Accepts optional day_id filter for D.4 (Dropoff filters).

create or replace function public.get_dropoff_rate(
  p_scenario_id text,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_min_visits int default 20,
  p_day_id text default null
)
returns table (
  node_id text,
  day_id text,
  dropoff_count bigint,
  entered_count bigint,
  dropoff_rate numeric,
  avg_time_on_node_ms numeric
)
language sql stable security definer
as $$
  with visits as (
    select (event_data->>'node_id') as node_id, day_id, count(*)::bigint as entered
    from public.game_events
    where event_type = 'node_entered'
      and scenario_id = p_scenario_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
      and (p_day_id is null or day_id = p_day_id)
    group by 1, 2
  ),
  drops as (
    select
      coalesce(event_data->>'node_id', event_data->>'last_node_id') as node_id,
      day_id,
      count(*)::bigint as drops,
      avg(nullif((event_data->>'time_on_node_ms')::numeric, 0)) as avg_t
    from public.game_events
    where event_type = 'dropped_off'
      and scenario_id = p_scenario_id
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
      and (p_day_id is null or day_id = p_day_id)
    group by 1, 2
  )
  select
    v.node_id,
    v.day_id,
    coalesce(d.drops, 0) as dropoff_count,
    v.entered as entered_count,
    case when v.entered > 0 then coalesce(d.drops, 0)::numeric / v.entered else 0 end as dropoff_rate,
    d.avg_t as avg_time_on_node_ms
  from visits v
  left join drops d on d.node_id = v.node_id and d.day_id = v.day_id
  where v.entered >= p_min_visits
  order by dropoff_rate desc, dropoff_count desc
  limit 100;
$$;
