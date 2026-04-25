-- 037_lessons_funnel_rpc.sql
-- RPCs for /admin/lessons page: aggregates funnel_events into a 4-lesson funnel
-- summary, breaks down final-offer consultation clicks by block location, and
-- returns recent funnel_events for a live feed. ADD-only.

create or replace function public.get_lessons_funnel_summary(
  p_from timestamptz,
  p_to timestamptz
)
returns table(
  step text,
  unique_leads bigint,
  total_events bigint
)
language sql stable security definer
set search_path = public
as $$
  with steps as (
    select unnest(array[
      'landing_view',
      'play_clicked',
      'lead_created',
      'lesson_opened_1',
      'quiz_passed_1',
      'lesson_opened_2',
      'quiz_passed_2',
      'lesson_opened_3',
      'quiz_passed_3',
      'lesson_opened_4',
      'quiz_passed_4',
      'funnel_completed',
      'final_page_viewed',
      'final_cta_simulator_clicked',
      'final_cta_learn_more_clicked',
      'final_consultation_opened',
      'final_consultation_submitted'
    ])::text as step
  ),
  events as (
    select
      case
        when event_type = 'lesson_opened' and lesson_index = 1 then 'lesson_opened_1'
        when event_type = 'lesson_opened' and lesson_index = 2 then 'lesson_opened_2'
        when event_type = 'lesson_opened' and lesson_index = 3 then 'lesson_opened_3'
        when event_type = 'lesson_opened' and lesson_index = 4 then 'lesson_opened_4'
        when event_type = 'quiz_passed' and lesson_index = 1 then 'quiz_passed_1'
        when event_type = 'quiz_passed' and lesson_index = 2 then 'quiz_passed_2'
        when event_type = 'quiz_passed' and lesson_index = 3 then 'quiz_passed_3'
        when event_type = 'quiz_passed' and lesson_index = 4 then 'quiz_passed_4'
        else event_type::text
      end as step,
      lead_id
    from public.funnel_events
    where (p_from is null or created_at >= p_from)
      and (p_to is null or created_at <= p_to)
  )
  select
    s.step,
    coalesce(count(distinct e.lead_id), 0)::bigint as unique_leads,
    coalesce(count(e.*), 0)::bigint as total_events
  from steps s
  left join events e on e.step = s.step
  group by s.step
  order by array_position(array[
    'landing_view',
    'play_clicked',
    'lead_created',
    'lesson_opened_1',
    'quiz_passed_1',
    'lesson_opened_2',
    'quiz_passed_2',
    'lesson_opened_3',
    'quiz_passed_3',
    'lesson_opened_4',
    'quiz_passed_4',
    'funnel_completed',
    'final_page_viewed',
    'final_cta_simulator_clicked',
    'final_cta_learn_more_clicked',
    'final_consultation_opened',
    'final_consultation_submitted'
  ]::text[], s.step);
$$;

revoke all on function public.get_lessons_funnel_summary(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.get_lessons_funnel_summary(timestamptz, timestamptz) to service_role;


create or replace function public.get_final_offer_breakdown(
  p_from timestamptz,
  p_to timestamptz
)
returns table(
  location text,
  opens bigint,
  unique_leads bigint
)
language sql stable security definer
set search_path = public
as $$
  select
    coalesce(meta->>'location', 'unknown') as location,
    count(*)::bigint as opens,
    count(distinct lead_id)::bigint as unique_leads
  from public.funnel_events
  where event_type = 'final_consultation_opened'
    and (p_from is null or created_at >= p_from)
    and (p_to is null or created_at <= p_to)
  group by 1
  order by opens desc;
$$;

revoke all on function public.get_final_offer_breakdown(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.get_final_offer_breakdown(timestamptz, timestamptz) to service_role;


create or replace function public.get_recent_funnel_events(
  p_limit int default 50
)
returns table(
  id uuid,
  created_at timestamptz,
  event_type text,
  lesson_index smallint,
  lead_id uuid,
  lead_name text,
  lead_phone text,
  meta jsonb
)
language sql stable security definer
set search_path = public
as $$
  select
    fe.id,
    fe.created_at,
    fe.event_type::text,
    fe.lesson_index,
    fe.lead_id,
    l.name as lead_name,
    l.phone as lead_phone,
    fe.meta
  from public.funnel_events fe
  left join public.leads l on l.id = fe.lead_id
  order by fe.created_at desc
  limit greatest(p_limit, 1);
$$;

revoke all on function public.get_recent_funnel_events(int) from public, anon, authenticated;
grant execute on function public.get_recent_funnel_events(int) to service_role;
