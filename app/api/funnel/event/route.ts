import { NextResponse } from 'next/server';
import { logEvent, validateToken } from '@/lib/funnel/progress-server';
import type { FunnelEventType } from '@/lib/funnel/types';

export const runtime = 'nodejs';

const ANON_ALLOWED: ReadonlySet<FunnelEventType> = new Set(['landing_view', 'play_clicked']);
const ALL_TYPES: ReadonlySet<FunnelEventType> = new Set([
  'landing_view',
  'play_clicked',
  'lead_created',
  'lesson_opened',
  'quiz_shown',
  'quiz_wrong',
  'quiz_passed',
  'funnel_completed',
  'simulator_redirected',
  'final_page_viewed',
  'final_cta_simulator_clicked',
  'final_cta_learn_more_clicked',
  'final_consultation_opened',
  'final_consultation_submitted',
]);

interface Body {
  event_type?: string;
  lead_id?: string;
  token?: string;
  lesson_index?: number;
  meta?: Record<string, unknown>;
}

export async function POST(request: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const evt = body.event_type as FunnelEventType | undefined;
  if (!evt || !ALL_TYPES.has(evt)) {
    return NextResponse.json({ error: 'invalid_event_type' }, { status: 400 });
  }

  if (ANON_ALLOWED.has(evt) && !body.lead_id) {
    await logEvent({ leadId: null, eventType: evt, meta: body.meta });
    return new Response(null, { status: 204 });
  }

  const v = await validateToken({
    leadId: body.lead_id ?? '',
    token: body.token ?? '',
  });
  if (!v.ok || !v.leadId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  await logEvent({
    leadId: v.leadId,
    eventType: evt,
    lessonIndex: body.lesson_index,
    meta: body.meta,
  });
  return new Response(null, { status: 204 });
}
