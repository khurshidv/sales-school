-- 021: Player admin-side processing state
-- ADD-only. Separate table (not on players) because players is user-facing
-- and we want admin metadata isolated from game state.

create table if not exists public.player_admin_states (
  player_id uuid primary key references public.players(id) on delete cascade,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'done', 'hire', 'skip')),
  assigned_to text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_player_admin_states_status on public.player_admin_states(status);

alter table public.player_admin_states enable row level security;
grant all on public.player_admin_states to service_role;

-- History table
create table if not exists public.player_admin_state_history (
  id bigserial primary key,
  player_id uuid not null references public.players(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by text,
  changed_at timestamptz not null default now()
);
create index if not exists idx_player_admin_history_player on public.player_admin_state_history(player_id, changed_at desc);

alter table public.player_admin_state_history enable row level security;
grant all on public.player_admin_state_history to service_role;

create or replace function public.log_player_admin_state_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    insert into public.player_admin_state_history (player_id, from_status, to_status, changed_by)
    values (new.player_id, old.status, new.status, new.assigned_to);
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_player_admin_states_change on public.player_admin_states;
create trigger trg_player_admin_states_change
  before update on public.player_admin_states
  for each row
  execute function public.log_player_admin_state_change();

comment on table public.player_admin_states is 'Admin-owned workflow state for each player — separate from game state';
