import { NextResponse } from 'next/server';
import { validateToken, loadProgress } from '@/lib/funnel/progress-server';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  let body: { lead_id?: string; token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const res = await validateToken({ leadId: body.lead_id ?? '', token: body.token ?? '' });
  if (!res.ok || !res.leadId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const progress = await loadProgress(res.leadId);
  if (!progress) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({
    current_lesson: progress.currentLesson,
    completed_lessons: progress.completedLessons,
    finished_at: progress.finishedAt,
  });
}
