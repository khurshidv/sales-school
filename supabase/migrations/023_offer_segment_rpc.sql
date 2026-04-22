-- 023: Segment breakdown for offer events
-- Aggregates views/clicks/conversions grouped by a whitelisted column name.
-- ADD-only.

create or replace function public.get_offer_segment_breakdown(
  p_field text,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (segment text, views bigint, clicks bigint, conversions bigint)
language plpgsql
stable
as $$
declare
  safe_field text;
begin
  -- Whitelist guard: reject anything not in the known segment columns.
  if p_field not in ('device_type', 'browser') then
    raise exception 'invalid field: %', p_field;
  end if;
  safe_field := p_field;

  return query execute format($q$
    select
      coalesce(%I::text, '(unknown)') as segment,
      count(*) filter (where event_type = 'offer_view') as views,
      count(*) filter (where event_type = 'offer_cta_click') as clicks,
      count(*) filter (where event_type = 'offer_conversion') as conversions
    from public.offer_events
    where ($1 is null or created_at >= $1)
      and ($2 is null or created_at <= $2)
    group by 1
    order by views desc
  $q$, safe_field) using p_from, p_to;
end;
$$;

grant execute on function public.get_offer_segment_breakdown(text, timestamptz, timestamptz) to service_role;
