-- 029_funnel_v2_rpc.sql
-- Generalized UTM funnel over players/page_events/leads.
-- Dimensions: utm_source / utm_medium / utm_campaign (the intersection of
-- columns that exist across all three source tables).

create or replace function public.get_utm_funnel_v2(
  p_dimension text,
  p_from timestamptz default null,
  p_to timestamptz default null
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
  $q$, p_dimension, p_from, p_to);
end;
$$;

create or replace function public.get_utm_trend(
  p_utm_source text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  bucket_date date,
  registered bigint,
  completed bigint,
  consultations bigint
)
language sql stable security definer
as $$
  with d as (
    select generate_series(
      coalesce(p_from::date, (now() - interval '30 days')::date),
      coalesce(p_to::date, now()::date),
      interval '1 day'
    )::date as bucket_date
  ),
  reg as (
    select created_at::date as d, count(*)::bigint as c
    from public.players
    where coalesce(nullif(utm_source, ''), 'direct') = coalesce(p_utm_source, 'direct')
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  ),
  comp as (
    select e.created_at::date as d, count(distinct e.player_id)::bigint as c
    from public.game_events e
    join public.players p on p.id = e.player_id
    where e.event_type = 'game_completed'
      and coalesce(nullif(p.utm_source, ''), 'direct') = coalesce(p_utm_source, 'direct')
      and (p_from is null or e.created_at >= p_from)
      and (p_to is null or e.created_at <= p_to)
    group by 1
  ),
  ld as (
    select created_at::date as d, count(*)::bigint as c
    from public.leads
    where coalesce(nullif(utm_source, ''), 'direct') = coalesce(p_utm_source, 'direct')
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  )
  select d.bucket_date, coalesce(reg.c, 0), coalesce(comp.c, 0), coalesce(ld.c, 0)
  from d
  left join reg  on reg.d  = d.bucket_date
  left join comp on comp.d = d.bucket_date
  left join ld   on ld.d   = d.bucket_date
  order by d.bucket_date;
$$;
