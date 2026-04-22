-- 030_dropoff_trend_rpc.sql
-- Daily drop-off rate by scenario. rate = dropped / entered.
create or replace function public.get_dropoff_trend(
  p_scenario_id text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (bucket_date date, entered bigint, dropped bigint, rate numeric)
language sql stable security definer
as $$
  with e as (
    select created_at::date as d, count(*)::bigint as n
    from public.game_events
    where scenario_id = p_scenario_id and event_type = 'node_entered'
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  ),
  dr as (
    select created_at::date as d, count(*)::bigint as n
    from public.game_events
    where scenario_id = p_scenario_id and event_type = 'dropped_off'
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  )
  select e.d, e.n, coalesce(dr.n, 0),
    case when e.n > 0 then coalesce(dr.n, 0)::numeric / e.n else 0 end
  from e left join dr on dr.d = e.d order by e.d;
$$;
