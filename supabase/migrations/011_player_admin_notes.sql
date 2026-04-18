-- Phase 6: HR-style notes that admins can save per player.
-- ADD-only.

alter table public.players
  add column if not exists admin_notes text not null default '';
