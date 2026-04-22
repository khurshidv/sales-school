-- 024: Variant (A/B) breakdown for offer events
-- ADD-only.

create or replace function public.get_offer_variant_breakdown(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  variant_id text,
  views bigint,
  clicks bigint,
  conversions bigint,
  first_seen timestamptz,
  last_seen timestamptz
)
language sql
stable
as $$
  select
    coalesce(variant_id, '(no variant)') as variant_id,
    count(*) filter (where event_type = 'offer_view') as views,
    count(*) filter (where event_type = 'offer_cta_click') as clicks,
    count(*) filter (where event_type = 'offer_conversion') as conversions,
    min(created_at) as first_seen,
    max(created_at) as last_seen
  from public.offer_events
  where (p_from is null or created_at >= p_from)
    and (p_to is null or created_at <= p_to)
  group by 1
  order by views desc;
$$;

grant execute on function public.get_offer_variant_breakdown(timestamptz, timestamptz) to service_role;
