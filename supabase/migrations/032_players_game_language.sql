-- 032_players_game_language.sql
-- ADD-only: stores the UI language the player chose at onboarding.

alter table public.players
  add column if not exists game_language text
    check (game_language in ('uz', 'ru') or game_language is null);

create index if not exists players_game_language_idx
  on public.players(game_language)
  where game_language is not null;
