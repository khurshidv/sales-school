-- 025_utm_spend.sql
-- ADD-only: stores manual UTM spend input for CPL/ROAS calculations.
-- Admin posts daily/weekly spend aggregates via /api/admin/utm-spend.

create table if not exists public.utm_spend (
  id uuid primary key default gen_random_uuid(),
  bucket_date date not null,
  utm_source text not null,
  utm_medium text,
  utm_campaign text,
  amount_kzt numeric(14,2) not null check (amount_kzt >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket_date, utm_source, utm_medium, utm_campaign)
);

create index if not exists utm_spend_date_idx on public.utm_spend(bucket_date desc);
create index if not exists utm_spend_source_idx on public.utm_spend(utm_source);

create or replace function public.tg_utm_spend_updated() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_utm_spend_updated on public.utm_spend;
create trigger trg_utm_spend_updated
  before update on public.utm_spend
  for each row execute function public.tg_utm_spend_updated();

create or replace function public.get_utm_spend_rollup(
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  utm_source text,
  total_kzt numeric,
  days bigint
)
language sql stable security definer
as $$
  select utm_source, sum(amount_kzt)::numeric as total_kzt, count(distinct bucket_date)::bigint as days
  from public.utm_spend
  where (p_from is null or bucket_date >= p_from::date)
    and (p_to is null or bucket_date <= p_to::date)
  group by utm_source
  order by total_kzt desc;
$$;
