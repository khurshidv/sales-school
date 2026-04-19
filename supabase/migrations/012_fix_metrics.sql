-- Fix 1: get_page_summary bounce_rate can exceed 100% when a session has
--         multiple page_leave events — the JOIN produced duplicate rows.
--         Adding DISTINCT in bounced CTE caps each session to one row.
create or replace function public.get_page_summary(
  p_slug text,
  p_from timestamptz,
  p_to timestamptz
)
returns json as $$
declare
  result json;
begin
  with views as (
    select count(*) as total_views,
           count(distinct visitor_id) as unique_visitors
    from public.page_events
    where page_slug = p_slug
      and event_type = 'page_view'
      and created_at between p_from and p_to
  ),
  sessions as (
    select distinct session_id
    from public.page_events
    where page_slug = p_slug
      and event_type = 'page_view'
      and created_at between p_from and p_to
  ),
  bounced as (
    select distinct s.session_id
    from sessions s
    join public.page_events pl on pl.session_id = s.session_id
      and pl.page_slug = p_slug
      and pl.event_type = 'page_leave'
      and (pl.event_data->>'duration_ms')::int < 3000
    where not exists (
      select 1 from public.page_events pe
      where pe.session_id = s.session_id
        and pe.page_slug = p_slug
        and pe.event_type in ('cta_click', 'scroll_depth')
    )
  ),
  durations as (
    select avg((event_data->>'duration_ms')::int) as avg_duration_ms
    from public.page_events
    where page_slug = p_slug
      and event_type = 'page_leave'
      and created_at between p_from and p_to
      and event_data->>'duration_ms' is not null
  ),
  cta_clicks as (
    select count(distinct session_id) as click_sessions
    from public.page_events
    where page_slug = p_slug
      and event_type = 'cta_click'
      and created_at between p_from and p_to
  )
  select json_build_object(
    'total_views', v.total_views,
    'unique_visitors', v.unique_visitors,
    'bounce_rate', case when (select count(*) from sessions) > 0
      then round((select count(*) from bounced)::numeric / (select count(*) from sessions) * 100, 1)
      else 0 end,
    'avg_duration_ms', coalesce(d.avg_duration_ms, 0)::int,
    'conversion_rate', case when v.total_views > 0
      then round(c.click_sessions::numeric / v.total_views * 100, 1)
      else 0 end
  ) into result
  from views v, durations d, cta_clicks c;

  return result;
end;
$$ language plpgsql security definer;

-- Fix 2: get_offer_funnel mixed player_id vs session_id units.
--         game_completed counted distinct player_id; offer_* counted distinct session_id.
--         Unify everything to distinct player_id (where player_id is not null).
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
      select count(distinct player_id)
      from public.offer_events
      where event_type = 'offer_view'
        and player_id is not null
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    ),
    'offer_cta_click', (
      select count(distinct player_id)
      from public.offer_events
      where event_type = 'offer_cta_click'
        and player_id is not null
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    ),
    'offer_conversion', (
      select count(distinct player_id)
      from public.offer_events
      where event_type = 'offer_conversion'
        and player_id is not null
        and (p_from is null or created_at >= p_from)
        and (p_to is null or created_at <= p_to)
    )
  );
$$;

-- Fix 3: get_utm_funnel visitors == registered (both were count(distinct p.id) from players).
--         visitors should be anonymous page_view counts from page_events by utm_source.
create or replace function public.get_utm_funnel(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  utm_source text,
  visitors bigint,
  registered bigint,
  started bigint,
  completed bigint
)
language sql
stable
security definer
as $$
  with anon_visitors as (
    select
      coalesce(utm_source, '(none)') as src,
      count(distinct visitor_id)::bigint as cnt
    from public.page_events
    where event_type = 'page_view'
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  ),
  players_in_range as (
    select id, coalesce(utm_source, '(none)') as src
    from public.players
    where (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
  ),
  events_in_range as (
    select e.player_id, e.event_type
    from public.game_events e
    where (p_from is null or e.created_at >= p_from)
      and (p_to is null or e.created_at <= p_to)
  ),
  starts as (
    select distinct player_id from events_in_range where event_type = 'day_started'
  ),
  completions as (
    select distinct player_id from public.completed_scenarios
    where (p_from is null or completed_at >= p_from)
      and (p_to is null or completed_at <= p_to)
  ),
  all_sources as (
    select src from anon_visitors
    union
    select src from players_in_range
  )
  select
    s.src as utm_source,
    coalesce(av.cnt, 0)::bigint as visitors,
    count(distinct p.id)::bigint as registered,
    count(distinct st.player_id)::bigint as started,
    count(distinct c.player_id)::bigint as completed
  from all_sources s
  left join anon_visitors av on av.src = s.src
  left join players_in_range p on p.src = s.src
  left join starts st on st.player_id = p.id
  left join completions c on c.player_id = p.id
  group by s.src, av.cnt
  order by visitors desc;
$$;

-- New: get_participant_stats — global KPI totals for the Participants page header.
--      These can't be derived from the paginated player slice shown in the UI.
create or replace function public.get_participant_stats()
returns json
language sql
stable
security definer
as $$
  select json_build_object(
    'total_sa', (
      select count(distinct player_id)
      from public.completed_scenarios
      where rating in ('S', 'A')
    ),
    'total_any_day', (
      select count(distinct player_id)
      from public.completed_scenarios
    )
  );
$$;
