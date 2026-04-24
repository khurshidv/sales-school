import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  FunnelProgress,
  FunnelEventType,
  LessonIndex,
  FunnelIdentity,
} from './types';

export async function validateToken(
  identity: FunnelIdentity,
): Promise<{ ok: boolean; leadId: string | null }> {
  if (!identity.leadId || !identity.token) return { ok: false, leadId: null };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('leads')
    .select('id, funnel_token')
    .eq('id', identity.leadId)
    .limit(1)
    .maybeSingle();
  if (error || !data) return { ok: false, leadId: null };
  if (data.funnel_token !== identity.token) return { ok: false, leadId: null };
  return { ok: true, leadId: data.id as string };
}

export async function loadProgress(leadId: string): Promise<FunnelProgress | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('funnel_progress')
    .select('lead_id, current_lesson, completed_lessons, finished_at')
    .eq('lead_id', leadId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    leadId: data.lead_id as string,
    currentLesson: data.current_lesson as LessonIndex,
    completedLessons: (data.completed_lessons ?? []) as LessonIndex[],
    finishedAt: (data.finished_at as string) ?? null,
  };
}

export async function advanceProgress(
  leadId: string,
  lessonJustPassed: LessonIndex,
): Promise<FunnelProgress | null> {
  const admin = createAdminClient();
  const current = await loadProgress(leadId);
  if (!current) return null;
  const completed = Array.from(new Set([...current.completedLessons, lessonJustPassed])).sort(
    (a, b) => a - b,
  ) as LessonIndex[];
  const next = (lessonJustPassed === 4 ? 4 : (lessonJustPassed + 1)) as LessonIndex;
  const finishedAt = lessonJustPassed === 4 ? new Date().toISOString() : null;
  const { data, error } = await admin
    .from('funnel_progress')
    .update({
      current_lesson: next,
      completed_lessons: completed,
      finished_at: finishedAt ?? current.finishedAt,
    })
    .eq('lead_id', leadId)
    .select('lead_id, current_lesson, completed_lessons, finished_at')
    .maybeSingle();
  if (error || !data) return null;
  return {
    leadId: data.lead_id as string,
    currentLesson: data.current_lesson as LessonIndex,
    completedLessons: (data.completed_lessons ?? []) as LessonIndex[],
    finishedAt: (data.finished_at as string) ?? null,
  };
}

export async function logEvent(input: {
  leadId: string | null;
  eventType: FunnelEventType;
  lessonIndex?: number;
  meta?: Record<string, unknown>;
}): Promise<void> {
  const admin = createAdminClient();
  await admin.from('funnel_events').insert({
    lead_id: input.leadId,
    event_type: input.eventType,
    lesson_index: input.lessonIndex ?? null,
    meta: input.meta ?? {},
  });
}
