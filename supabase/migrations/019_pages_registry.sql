-- 019: pages_registry — admin-editable registry of landing pages
-- ADD-only migration. No modifications to existing tables.

create table if not exists public.pages_registry (
  slug text primary key,
  title_ru text not null,
  title_uz text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed with current hardcoded pages
insert into public.pages_registry (slug, title_ru, title_uz) values
  ('home', 'Вебинар', 'Vebinar'),
  ('target', 'Курс', 'Kurs')
on conflict (slug) do nothing;

-- RLS: closed by default (admin reads via service_role)
alter table public.pages_registry enable row level security;

-- service_role bypasses RLS; grant SELECT to authenticated for potential future
-- client usage (game UI might want to show page titles).
grant select on public.pages_registry to anon, authenticated;
grant all on public.pages_registry to service_role;

comment on table public.pages_registry is 'Admin-editable registry of landing pages with localized titles';
