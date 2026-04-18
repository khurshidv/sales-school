-- Phase 5: enable Supabase Realtime on game_events + new RPC for live KPIs.
-- ADD-only.

-- 1. Enable realtime publication on game_events (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'game_events'
  ) then
    execute 'alter publication supabase_realtime add table public.game_events';
  end if;
end
$$;

-- 2. Live KPI RPC: active (heartbeat in last 90s), today (game_started today),
--    completed_today (game_completed today).
create or replace function public.get_realtime_kpis()
returns json
language sql
stable
security definer
as $$
  select json_build_object(
    'active', (
      select count(distinct player_id)
      from public.game_events
      where event_type = 'heartbeat'
        and created_at >= now() - interval '90 seconds'
    ),
    'today', (
      select count(distinct player_id)
      from public.game_events
      where event_type = 'game_started'
        and created_at >= date_trunc('day', now())
    ),
    'completed_today', (
      select count(distinct player_id)
      from public.game_events
      where event_type = 'game_completed'
        and created_at >= date_trunc('day', now())
    )
  );
$$;
