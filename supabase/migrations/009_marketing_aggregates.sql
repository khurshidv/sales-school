-- Phase 3: marketing aggregates for /admin/overview, /admin/funnel, /admin/offer.
-- ADD-only. No table/column alterations.
-- All functions STABLE + SECURITY DEFINER (read-only on game_events / players /
-- offer_events / completed_scenarios).

-- -----------------------------------------------------------------------------
-- get_utm_funnel: counts of distinct players at each funnel step, grouped by
-- utm_source (or '(none)' for direct traffic). One row per source per step.
-- -----------------------------------------------------------------------------
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
  with players_in_range as (
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
  )
  select
    p.src as utm_source,
    count(distinct p.id)::bigint as visitors,
    count(distinct p.id)::bigint as registered,
    count(distinct s.player_id)::bigint as started,
    count(distinct c.player_id)::bigint as completed
  from players_in_range p
  left join starts s on s.player_id = p.id
  left join completions c on c.player_id = p.id
  group by p.src
  order by visitors desc;
$$;

-- -----------------------------------------------------------------------------
-- get_daily_trends: per-day counts of key events for line charts.
-- Returns one row per day in the requested range.
-- -----------------------------------------------------------------------------
create or replace function public.get_daily_trends(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  bucket_date date,
  registered bigint,
  game_started bigint,
  game_completed bigint
)
language sql
stable
security definer
as $$
  with date_series as (
    select generate_series(
      coalesce(p_from::date, current_date - interval '30 days'),
      coalesce(p_to::date, current_date),
      interval '1 day'
    )::date as d
  ),
  reg as (
    select created_at::date as d, count(*)::bigint as c
    from public.players
    where (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  ),
  starts as (
    select created_at::date as d, count(distinct player_id)::bigint as c
    from public.game_events
    where event_type = 'game_started'
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  ),
  completes as (
    select created_at::date as d, count(distinct player_id)::bigint as c
    from public.game_events
    where event_type = 'game_completed'
      and (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
    group by 1
  )
  select
    ds.d as bucket_date,
    coalesce(reg.c, 0) as registered,
    coalesce(starts.c, 0) as game_started,
    coalesce(completes.c, 0) as game_completed
  from date_series ds
  left join reg on reg.d = ds.d
  left join starts on starts.d = ds.d
  left join completes on completes.d = ds.d
  order by ds.d asc;
$$;

-- -----------------------------------------------------------------------------
-- get_offer_breakdown_by_rating: offer events grouped by player's last rating.
-- -----------------------------------------------------------------------------
create or replace function public.get_offer_breakdown_by_rating(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  rating text,
  views bigint,
  clicks bigint
)
language sql
stable
security definer
as $$
  with player_rating as (
    select player_id,
      case
        when bool_or(rating = 'S') then 'S'
        when bool_or(rating = 'A') then 'A'
        when bool_or(rating = 'B') then 'B'
        when bool_or(rating = 'C') then 'C'
        else 'F'
      end as rating
    from public.completed_scenarios
    group by player_id
  ),
  enriched as (
    select oe.event_type, coalesce(pr.rating, 'unknown') as rating
    from public.offer_events oe
    left join player_rating pr on pr.player_id = oe.player_id
    where (p_from is null or oe.created_at >= p_from)
      and (p_to is null or oe.created_at <= p_to)
  )
  select
    rating,
    count(*) filter (where event_type = 'offer_view')::bigint as views,
    count(*) filter (where event_type = 'offer_cta_click')::bigint as clicks
  from enriched
  group by rating
  order by
    case rating when 'S' then 1 when 'A' then 2 when 'B' then 3 when 'C' then 4 when 'F' then 5 else 6 end;
$$;

-- -----------------------------------------------------------------------------
-- get_offer_breakdown_by_utm: offer events grouped by player's utm_source.
-- -----------------------------------------------------------------------------
create or replace function public.get_offer_breakdown_by_utm(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  utm_source text,
  views bigint,
  clicks bigint
)
language sql
stable
security definer
as $$
  with enriched as (
    select oe.event_type, coalesce(p.utm_source, '(none)') as utm_source
    from public.offer_events oe
    left join public.players p on p.id = oe.player_id
    where (p_from is null or oe.created_at >= p_from)
      and (p_to is null or oe.created_at <= p_to)
  )
  select
    utm_source,
    count(*) filter (where event_type = 'offer_view')::bigint as views,
    count(*) filter (where event_type = 'offer_cta_click')::bigint as clicks
  from enriched
  group by utm_source
  order by views desc;
$$;
