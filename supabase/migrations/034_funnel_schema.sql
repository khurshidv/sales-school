-- 034_funnel_schema.sql
-- Adds funnel_progress, funnel_events, and links funnel leads <-> players.
-- ADD-only: no drops. Safe to re-run.

alter table public.leads
  add column if not exists funnel_token uuid,
  add column if not exists player_id uuid references public.players(id) on delete set null;

create index if not exists idx_leads_funnel_token on public.leads(funnel_token);
create index if not exists idx_leads_player_id on public.leads(player_id);

alter table public.players
  add column if not exists lead_id uuid references public.leads(id) on delete set null;

create index if not exists idx_players_lead_id on public.players(lead_id);

-- De-facto phone uniqueness for players. Use CONCURRENTLY if run outside of a transaction
-- block; this migration is applied via Supabase MCP which wraps in a txn, so plain CREATE
-- INDEX is correct. If duplicates exist, this will fail: clean them up first with
--   select phone, count(*) from public.players group by 1 having count(*) > 1;
create unique index if not exists idx_players_phone_unique on public.players(phone);

create table if not exists public.funnel_progress (
  lead_id uuid primary key references public.leads(id) on delete cascade,
  current_lesson smallint not null default 1 check (current_lesson between 1 and 4),
  completed_lessons smallint[] not null default '{}',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_funnel_progress()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_funnel_progress_touch on public.funnel_progress;
create trigger trg_funnel_progress_touch
  before update on public.funnel_progress
  for each row execute function public.touch_funnel_progress();

do $$ begin
  create type funnel_event_type as enum (
    'landing_view',
    'play_clicked',
    'lead_created',
    'lesson_opened',
    'quiz_shown',
    'quiz_wrong',
    'quiz_passed',
    'funnel_completed',
    'simulator_redirected'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  event_type funnel_event_type not null,
  lesson_index smallint,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_funnel_events_lead on public.funnel_events(lead_id);
create index if not exists idx_funnel_events_type_time on public.funnel_events(event_type, created_at desc);
