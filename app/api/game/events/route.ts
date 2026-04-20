import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateEventsPayload } from './validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const v = validateEventsPayload(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from('game_events').insert(v.events);
  if (error) {
    console.warn('[api/game/events] insert failed', error.message);
    return NextResponse.json({ error: 'insert failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: v.events.length }, { status: 202 });
}
