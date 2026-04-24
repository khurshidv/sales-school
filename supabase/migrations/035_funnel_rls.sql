-- 035_funnel_rls.sql
-- Locks funnel_progress and funnel_events to service-role only.
-- All client access goes through server-side Next.js API routes that validate the funnel token.

alter table public.funnel_progress enable row level security;
alter table public.funnel_events enable row level security;

-- No policies defined for anon / authenticated => no access.
-- Service role bypasses RLS by default.

-- Explicit revokes for clarity:
revoke all on public.funnel_progress from anon, authenticated;
revoke all on public.funnel_events from anon, authenticated;
