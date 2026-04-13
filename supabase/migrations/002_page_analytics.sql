-- Page Analytics — anonymous visitor tracking for marketing pages
-- No player_id required — uses visitor_id (localStorage UUID) + session_id (sessionStorage UUID)

-- 1. Page Events table
create table public.page_events (
  id uuid default gen_random_uuid() primary key,
  visitor_id text not null,
  session_id text not null,
  page_slug text not null,
  event_type text not null,
  event_data jsonb not null default '{}',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  device_type text,
  browser text,
  screen_width integer,
  screen_height integer,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_page_events_slug_type_created on public.page_events(page_slug, event_type, created_at);
create index idx_page_events_visitor on public.page_events(visitor_id);
create index idx_page_events_session on public.page_events(session_id);
create index idx_page_events_created on public.page_events(created_at);

-- RLS: anon can INSERT only, admin reads via service role
alter table public.page_events enable row level security;

create policy "anon_insert_page_events"
  on public.page_events for insert
  to anon with check (true);

-- 2. RPC: get_page_summary — aggregated KPIs for a single page
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
    select s.session_id
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

-- 3. RPC: get_page_breakdowns — detailed breakdowns for a single page
create or replace function public.get_page_breakdowns(
  p_slug text,
  p_from timestamptz,
  p_to timestamptz
)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'utm_breakdown', (
      select coalesce(json_agg(row_to_json(u)), '[]'::json)
      from (
        select
          coalesce(utm_source, 'direct') as source,
          coalesce(utm_medium, '-') as medium,
          coalesce(utm_campaign, '-') as campaign,
          count(*) as views,
          count(distinct visitor_id) as unique_visitors
        from public.page_events
        where page_slug = p_slug
          and event_type = 'page_view'
          and created_at between p_from and p_to
        group by utm_source, utm_medium, utm_campaign
        order by views desc
        limit 50
      ) u
    ),
    'device_breakdown', (
      select coalesce(json_agg(row_to_json(d)), '[]'::json)
      from (
        select
          coalesce(device_type, 'unknown') as device_type,
          count(*) as count
        from public.page_events
        where page_slug = p_slug
          and event_type = 'page_view'
          and created_at between p_from and p_to
        group by device_type
        order by count desc
      ) d
    ),
    'referrer_breakdown', (
      select coalesce(json_agg(row_to_json(r)), '[]'::json)
      from (
        select
          coalesce(referrer, 'direct') as referrer,
          count(*) as count
        from public.page_events
        where page_slug = p_slug
          and event_type = 'page_view'
          and created_at between p_from and p_to
          and referrer is not null
          and referrer != ''
        group by referrer
        order by count desc
        limit 20
      ) r
    ),
    'scroll_depth', (
      select coalesce(json_agg(row_to_json(s)), '[]'::json)
      from (
        select
          (event_data->>'depth')::int as depth,
          count(distinct session_id) as count
        from public.page_events
        where page_slug = p_slug
          and event_type = 'scroll_depth'
          and created_at between p_from and p_to
        group by (event_data->>'depth')::int
        order by depth
      ) s
    ),
    'daily_views', (
      select coalesce(json_agg(row_to_json(dv)), '[]'::json)
      from (
        select
          created_at::date as date,
          count(*) as views,
          count(distinct visitor_id) as unique_visitors
        from public.page_events
        where page_slug = p_slug
          and event_type = 'page_view'
          and created_at between p_from and p_to
        group by created_at::date
        order by date
      ) dv
    )
  ) into result;

  return result;
end;
$$ language plpgsql security definer;
