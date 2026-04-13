-- Add device fingerprint column to players for Instagram WebView identification.
-- Instagram's in-app browser clears localStorage after ~24h, so we need a
-- server-side way to map device → player for returning visitors.
-- Also add coins column if missing and last_seen_at for 24h re-onboarding logic.

alter table public.players
  add column if not exists device_fingerprint text,
  add column if not exists coins integer not null default 0,
  add column if not exists last_seen_at timestamptz not null default now();

-- Index for fast device lookup
create index if not exists idx_players_device_fingerprint
  on public.players(device_fingerprint)
  where device_fingerprint is not null;
