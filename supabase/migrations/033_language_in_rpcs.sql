-- 033_language_in_rpcs.sql
-- Add p_language parameter (nullable, 'uz' | 'ru') to 4 analytics RPCs.
-- CREATE OR REPLACE keeps ADD-only semantics — callers without p_language still work.

create or replace function public.get_utm_funnel_v2(
  p_dimension text,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_language text default null
)
returns table (
  segment text,
  visitors bigint,
  registered bigint,
  started bigint,
  completed bigint,
  consultations bigint
)
language plpgsql stable security definer
as $$
begin
  if p_dimension not in ('utm_source','utm_medium','utm_campaign') then
    raise exception 'invalid dimension: %', p_dimension;
  end if;

  return query execute format($q$
    with
    reg as (
      select coalesce(nullif(p.%1$I, ''), 'direct') as segment, p.id
      from public.players p
      where (%2$L::timestamptz is null or p.created_at >= %2$L::timestamptz)
        and (%3$L::timestamptz is null or p.created_at <= %3$L::timestamptz)
        and (%4$L::text is null or p.game_language = %4$L::text)
    ),
    visits as (
      select coalesce(nullif(%1$I, ''), 'direct') as segment,
             count(distinct visitor_id)::bigint as v
      from public.page_events
      where event_type = 'page_view'
        and (%2$L::timestamptz is null or created_at >= %2$L::timestamptz)
        and (%3$L::timestamptz is null or created_at <= %3$L::timestamptz)
      group by 1
    ),
    starts as (
      select segment, count(distinct id)::bigint as n
      from reg
      where exists (select 1 from public.game_events e where e.player_id = reg.id and e.event_type = 'game_started')
      group by 1
    ),
    completes as (
      select segment, count(distinct id)::bigint as n
      from reg
      where exists (select 1 from public.game_events e where e.player_id = reg.id and e.event_type = 'game_completed')
      group by 1
    ),
    cons as (
      select coalesce(nullif(l.%1$I, ''), 'direct') as segment, count(*)::bigint as n
      from public.leads l
      where (%2$L::timestamptz is null or l.created_at >= %2$L::timestamptz)
        and (%3$L::timestamptz is null or l.created_at <= %3$L::timestamptz)
      group by 1
    ),
    reg_roll as (select segment, count(*)::bigint as n from reg group by 1),
    segments as (
      select segment from reg_roll
      union select segment from visits
      union select segment from cons
    )
    select
      s.segment,
      coalesce(v.v,     0) as visitors,
      coalesce(r.n,     0) as registered,
      coalesce(st.n,    0) as started,
      coalesce(co.n,    0) as completed,
      coalesce(cn.n,    0) as consultations
    from segments s
    left join visits     v  on v.segment  = s.segment
    left join reg_roll   r  on r.segment  = s.segment
    left join starts     st on st.segment = s.segment
    left join completes  co on co.segment = s.segment
    left join cons       cn on cn.segment = s.segment
    order by visitors desc nulls last
  $q$, p_dimension, p_from, p_to, p_language);
end;
$$;

create or replace function public.get_thinking_percentiles(
  p_scenario_id text,
  p_day_id text default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_language text default null
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
    percentile_cont(0.5)  within group (order by (e.event_data->>'thinking_time_ms')::numeric) as p50_ms,
    percentile_cont(0.9)  within group (order by (e.event_data->>'thinking_time_ms')::numeric) as p90_ms,
    percentile_cont(0.95) within group (order by (e.event_data->>'thinking_time_ms')::numeric) as p95_ms,
    count(*)::bigint as sample_size
  from public.game_events e
  left join public.players p on p.id = e.player_id
  where e.event_type = 'choice_made'
    and e.scenario_id = p_scenario_id
    and (p_day_id is null or e.day_id = p_day_id)
    and (p_from is null or e.created_at >= p_from)
    and (p_to is null or e.created_at <= p_to)
    and (e.event_data->>'thinking_time_ms') is not null
    and (p_language is null or p.game_language = p_language);
$$;

create or replace function public.get_engagement_trend(
  p_scenario_id text,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_language text default null
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
    e.created_at::date as bucket_date,
    count(distinct e.player_id) filter (where e.event_type = 'day_started')::bigint as started,
    count(distinct e.player_id) filter (where e.event_type = 'day_completed')::bigint as completed,
    avg((e.event_data->>'thinking_time_ms')::numeric) filter (where e.event_type = 'choice_made') as avg_thinking_ms,
    case
      when count(distinct e.player_id) filter (where e.event_type = 'day_started') > 0
      then count(distinct e.player_id) filter (where e.event_type = 'day_completed')::numeric
         / count(distinct e.player_id) filter (where e.event_type = 'day_started')
      else 0
    end as completion_rate
  from public.game_events e
  left join public.players p on p.id = e.player_id
  where e.scenario_id = p_scenario_id
    and (p_from is null or e.created_at >= p_from)
    and (p_to is null or e.created_at <= p_to)
    and (p_language is null or p.game_language = p_language)
  group by 1
  order by 1;
$$;

create or replace function public.get_retention(
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_language text default null
)
returns table (
  cohort_date date,
  cohort_size bigint,
  d1_returned bigint,
  d7_returned bigint
)
language sql stable security definer
as $$
  with cohort_players as (
    select p.id as player_id
    from public.players p
    where (p_language is null or p.game_language = p_language)
  ),
  first_start as (
    select e.player_id, min(e.created_at)::date as start_date, min(e.created_at) as start_at
    from public.game_events e
    join cohort_players cp on cp.player_id = e.player_id
    where e.event_type = 'game_started'
      and (p_from is null or e.created_at >= p_from)
      and (p_to is null or e.created_at <= p_to)
    group by e.player_id
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
