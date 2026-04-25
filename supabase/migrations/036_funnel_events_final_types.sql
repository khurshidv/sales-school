-- 036_funnel_events_final_types.sql
-- Adds 5 new event types to funnel_event_type enum, used by /start/final page.
-- ADD-only. ALTER TYPE ... ADD VALUE is non-transactional in older PG, but Supabase
-- runs migrations outside the same transaction as the rest, so this is safe.

alter type public.funnel_event_type add value if not exists 'final_page_viewed';
alter type public.funnel_event_type add value if not exists 'final_cta_simulator_clicked';
alter type public.funnel_event_type add value if not exists 'final_cta_learn_more_clicked';
alter type public.funnel_event_type add value if not exists 'final_consultation_opened';
alter type public.funnel_event_type add value if not exists 'final_consultation_submitted';
