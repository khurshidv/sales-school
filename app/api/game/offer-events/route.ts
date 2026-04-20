import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateOfferEventPayload } from './validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const v = validateOfferEventPayload(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from('offer_events').insert(v.event);
  if (error) {
    console.warn('[api/game/offer-events] insert failed', error.message);
    return NextResponse.json({ error: 'insert failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
