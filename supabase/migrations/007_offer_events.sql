-- Phase 1: dedicated event store for the post-game offer landing page.
-- Keeps offer analytics separate from game_events (different retention,
-- different access patterns — offer events are conversion-critical).
-- ADD-only.

create table if not exists public.offer_events (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.players on delete set null,
  visitor_id text,               -- for pre-registration visits
  session_id text not null,
  event_type text not null,      -- offer_view | offer_cta_click | offer_conversion
  variant_id text,               -- A/B variant (nullable; 'default' if not testing)
  time_on_page_ms integer,
  scroll_depth integer,          -- 0-100
  cta_id text,                   -- which CTA was clicked
  event_data jsonb not null default '{}',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text,
  browser text,
  created_at timestamptz not null default now()
);

create index if not exists idx_offer_events_player on public.offer_events(player_id);
create index if not exists idx_offer_events_type_created on public.offer_events(event_type, created_at desc);
create index if not exists idx_offer_events_variant on public.offer_events(variant_id) where variant_id is not null;
create index if not exists idx_offer_events_session on public.offer_events(session_id);

-- RLS — anonymous writes (same pattern as page_events / game_events from
-- earlier migrations). Reads are admin-only via service role.
alter table public.offer_events enable row level security;

create policy "anon can insert offer_events"
  on public.offer_events for insert to anon
  with check (true);

create policy "authenticated can read offer_events"
  on public.offer_events for select to authenticated
  using (true);
