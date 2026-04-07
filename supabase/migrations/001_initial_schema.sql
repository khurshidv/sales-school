-- Sales School Game — Lead Funnel Schema (no auth)
-- Players identified by phone number, not auth.users
-- Full analytics tracking for funnel optimization

-- 1. Players (lead capture)
create table public.players (
  id uuid default gen_random_uuid() primary key,
  phone text not null unique,
  display_name text not null,
  avatar_id text not null default 'male',
  level integer not null default 1,
  total_xp integer not null default 0,
  total_score integer not null default 0,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Game Progress (save states)
create table public.game_progress (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.players on delete cascade not null,
  scenario_id text not null,
  day_id text not null,
  session_state jsonb not null default '{}',
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (player_id, scenario_id, day_id)
);

-- 3. Player Achievements
create table public.player_achievements (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.players on delete cascade not null,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  unique (player_id, achievement_id)
);

-- 4. Completed Scenarios (history + analytics)
create table public.completed_scenarios (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.players on delete cascade not null,
  scenario_id text not null,
  day_id text not null,
  score integer not null default 0,
  rating text not null default 'C',
  time_taken integer not null default 0,
  choices jsonb not null default '[]',
  completed_at timestamptz not null default now()
);

-- 5. Leaderboard
create table public.leaderboard (
  player_id uuid references public.players on delete cascade primary key,
  display_name text not null,
  avatar_id text not null default 'male',
  level integer not null default 1,
  total_score integer not null default 0,
  scenarios_completed integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 6. Game Events (full funnel analytics)
create table public.game_events (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.players on delete cascade not null,
  event_type text not null,
  event_data jsonb not null default '{}',
  scenario_id text,
  day_id text,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_game_events_player on public.game_events(player_id);
create index idx_game_events_type on public.game_events(event_type);
create index idx_game_events_created on public.game_events(created_at);
create index idx_players_phone on public.players(phone);

-- Triggers
create or replace function public.sync_leaderboard()
returns trigger as $$
begin
  insert into public.leaderboard (player_id, display_name, avatar_id, level, total_score, scenarios_completed, updated_at)
  values (new.id, new.display_name, new.avatar_id, new.level, new.total_score,
    (select count(*) from public.completed_scenarios where player_id = new.id), now())
  on conflict (player_id) do update set
    display_name = excluded.display_name, avatar_id = excluded.avatar_id,
    level = excluded.level, total_score = excluded.total_score,
    scenarios_completed = excluded.scenarios_completed, updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_player_update
  after insert or update on public.players
  for each row execute function public.sync_leaderboard();

alter publication supabase_realtime add table public.leaderboard;

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.players
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.game_progress
  for each row execute function public.handle_updated_at();
