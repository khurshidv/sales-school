-- 022: Daily aggregated offer funnel (views / clicks / conversions per day)
-- For the OfferTrendChart. ADD-only.

create or replace function public.get_offer_trend(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (day_id date, views bigint, clicks bigint, conversions bigint)
language sql
stable
as $$
  select
    date_trunc('day', created_at)::date as day_id,
    count(*) filter (where event_type = 'offer_view') as views,
    count(*) filter (where event_type = 'offer_cta_click') as clicks,
    count(*) filter (where event_type = 'offer_conversion') as conversions
  from public.offer_events
  where (p_from is null or created_at >= p_from)
    and (p_to is null or created_at <= p_to)
  group by day_id
  order by day_id;
$$;

grant execute on function public.get_offer_trend(timestamptz, timestamptz) to service_role;
