-- 031_pages_registry_annotations.sql
-- ADD-only: annotations on landing pages for scroll-funnel chart labels.

alter table public.pages_registry
  add column if not exists annotations jsonb not null default '[]'::jsonb;

comment on column public.pages_registry.annotations is
  'JSON array of { scroll_depth: 0..100, label: string, tone?: "offer"|"cta"|"info" }.';
