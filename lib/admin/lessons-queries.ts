import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export interface LessonsFunnelStep {
  step: string;
  uniqueLeads: number;
  totalEvents: number;
}

export interface FinalOfferBreakdownRow {
  location: string;
  opens: number;
  uniqueLeads: number;
}

export interface RecentFunnelEvent {
  id: string;
  createdAt: string;
  eventType: string;
  lessonIndex: number | null;
  leadId: string | null;
  leadName: string | null;
  leadPhone: string | null;
  meta: Record<string, unknown>;
}

export async function getLessonsFunnelSummary(
  from: string | null,
  to: string | null,
): Promise<LessonsFunnelStep[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_lessons_funnel_summary', {
    p_from: from,
    p_to: to,
  });
  if (error) {
    console.warn('[lessons-queries] get_lessons_funnel_summary', error.message);
    return [];
  }
  return (data ?? []).map((r: { step: string; unique_leads: number | string; total_events: number | string }) => ({
    step: r.step,
    uniqueLeads: Number(r.unique_leads),
    totalEvents: Number(r.total_events),
  }));
}

export async function getFinalOfferBreakdown(
  from: string | null,
  to: string | null,
): Promise<FinalOfferBreakdownRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_final_offer_breakdown', {
    p_from: from,
    p_to: to,
  });
  if (error) {
    console.warn('[lessons-queries] get_final_offer_breakdown', error.message);
    return [];
  }
  return (data ?? []).map((r: { location: string; opens: number | string; unique_leads: number | string }) => ({
    location: r.location,
    opens: Number(r.opens),
    uniqueLeads: Number(r.unique_leads),
  }));
}

export async function getRecentFunnelEvents(limit = 50): Promise<RecentFunnelEvent[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_recent_funnel_events', {
    p_limit: limit,
  });
  if (error) {
    console.warn('[lessons-queries] get_recent_funnel_events', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    id: string;
    created_at: string;
    event_type: string;
    lesson_index: number | null;
    lead_id: string | null;
    lead_name: string | null;
    lead_phone: string | null;
    meta: Record<string, unknown> | null;
  }) => ({
    id: r.id,
    createdAt: r.created_at,
    eventType: r.event_type,
    lessonIndex: r.lesson_index,
    leadId: r.lead_id,
    leadName: r.lead_name,
    leadPhone: r.lead_phone,
    meta: r.meta ?? {},
  }));
}
