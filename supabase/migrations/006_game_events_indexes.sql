-- Phase 1 of dashboard 2.0: perf indexes for new analytical queries.
-- ADD-only. Every index uses IF NOT EXISTS so replays are safe.
-- No table/column is altered; game is in production.

create index if not exists idx_game_events_player_created
  on public.game_events(player_id, created_at desc);

create index if not exists idx_game_events_scenario_day_type
  on public.game_events(scenario_id, day_id, event_type);

-- Expression index for common filter by node_id inside event_data
create index if not exists idx_game_events_data_node
  on public.game_events((event_data->>'node_id'))
  where event_data ? 'node_id';

-- Expression index for choice_made events filtering by choice_id
create index if not exists idx_game_events_data_choice
  on public.game_events((event_data->>'choice_id'))
  where event_type = 'choice_made';

-- GIN index for flexible JSONB filters (dashboards slice event_data ad-hoc)
create index if not exists idx_game_events_data_gin
  on public.game_events using gin (event_data jsonb_path_ops);
