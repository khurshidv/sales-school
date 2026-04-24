import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logEvent } from '@/lib/funnel/progress-server';

export const runtime = 'nodejs';

interface Body {
  lead_token?: string;
}

export async function POST(request: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const token = body.lead_token;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  const { data: lead } = await admin
    .from('leads')
    .select('id, name, phone, player_id')
    .eq('funnel_token', token)
    .maybeSingle();

  if (!lead) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!lead.player_id) {
    return NextResponse.json({ error: 'not_linked' }, { status: 404 });
  }

  const { data: player } = await admin
    .from('players')
    .select('id, name, phone')
    .eq('id', lead.player_id as string)
    .maybeSingle();

  if (!player) {
    return NextResponse.json({ error: 'not_linked' }, { status: 404 });
  }

  await logEvent({
    leadId: lead.id as string,
    eventType: 'simulator_redirected',
  });

  return NextResponse.json({
    player_id: player.id,
    name: player.name,
    phone: player.phone,
  });
}
