// app/api/funnel/quiz/route.ts
import { NextResponse } from 'next/server';
import { getQuiz } from '@/lib/funnel/quizzes';
import {
  validateToken,
  advanceProgress,
  logEvent,
} from '@/lib/funnel/progress-server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { LessonIndex } from '@/lib/funnel/types';

export const runtime = 'nodejs';

type Body = { lead_id?: string; token?: string; lesson?: number; answer_index?: number };

function isValid(body: Body): body is Required<Body> {
  if (typeof body.lead_id !== 'string' || typeof body.token !== 'string') return false;
  if (![1, 2, 3, 4].includes(body.lesson ?? -1)) return false;
  if (![0, 1, 2, 3].includes(body.answer_index ?? -1)) return false;
  return true;
}

async function resolvePlayerForLead(leadId: string): Promise<{ playerId: string; token: string } | null> {
  const admin = createAdminClient();

  const { data: lead } = await admin
    .from('leads')
    .select('name, phone, funnel_token')
    .eq('id', leadId)
    .maybeSingle();
  if (!lead) return null;

  const { data: existing } = await admin
    .from('players')
    .select('id')
    .eq('phone', lead.phone as string)
    .maybeSingle();

  let playerId: string;
  if (existing) {
    playerId = existing.id as string;
    await admin.from('players').update({ lead_id: leadId }).eq('id', playerId);
  } else {
    const { data: created, error: createErr } = await admin
      .from('players')
      .insert({ name: lead.name, phone: lead.phone, lead_id: leadId })
      .select('id')
      .single();
    if (createErr || !created) return null;
    playerId = created.id as string;
  }

  await admin.from('leads').update({ player_id: playerId }).eq('id', leadId);

  return { playerId, token: lead.funnel_token as string };
}

export async function POST(request: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const v = await validateToken({ leadId: body.lead_id!, token: body.token! });
  if (!v.ok || !v.leadId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const quiz = getQuiz(body.lesson!);
  if (!quiz) return NextResponse.json({ error: 'unknown_lesson' }, { status: 400 });

  const isCorrect = body.answer_index === quiz.correctIndex;

  if (!isCorrect) {
    await logEvent({
      leadId: v.leadId,
      eventType: 'quiz_wrong',
      lessonIndex: body.lesson!,
    });
    return NextResponse.json({ ok: false });
  }

  const advanced = await advanceProgress(v.leadId, body.lesson as LessonIndex);
  if (!advanced) {
    return NextResponse.json({ error: 'progress_update_failed' }, { status: 500 });
  }

  await logEvent({
    leadId: v.leadId,
    eventType: 'quiz_passed',
    lessonIndex: body.lesson!,
  });

  if (body.lesson === 4) {
    const player = await resolvePlayerForLead(v.leadId);
    if (!player) {
      return NextResponse.json({ error: 'player_link_failed' }, { status: 500 });
    }
    await logEvent({ leadId: v.leadId, eventType: 'funnel_completed' });
    return NextResponse.json({
      ok: true,
      next_url: `/game/play?lead_token=${encodeURIComponent(player.token)}`,
    });
  }

  return NextResponse.json({
    ok: true,
    next_url: `/start/dars/${(body.lesson as number) + 1}`,
  });
}
