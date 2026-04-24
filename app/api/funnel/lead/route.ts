import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  buildLeadDbRow,
  buildBitrixForwardBody,
  isValidFunnelLeadInput,
} from '@/lib/funnel/lead-payload';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!isValidFunnelLeadInput(body)) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const funnelToken = randomUUID();
  const admin = createAdminClient();

  const { data: leadRow, error: insertErr } = await admin
    .from('leads')
    .insert(buildLeadDbRow(body, funnelToken))
    .select('id, funnel_token')
    .single();

  if (insertErr || !leadRow) {
    return NextResponse.json({ error: 'lead_insert_failed' }, { status: 500 });
  }

  const leadId = leadRow.id as string;

  try {
    const forwardUrl = new URL('/api/bitrix/lead', request.url);
    await fetch(forwardUrl.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildBitrixForwardBody(body)),
    });
  } catch (err) {
    console.error('[funnel/lead] bitrix forward failed (non-fatal):', err);
  }

  await admin.from('funnel_progress').insert({ lead_id: leadId });

  await admin.from('funnel_events').insert({
    lead_id: leadId,
    event_type: 'lead_created',
    lesson_index: null,
    meta: {},
  });

  return NextResponse.json(
    {
      lead_id: leadId,
      token: leadRow.funnel_token,
      next_url: '/start/dars/1',
    },
    { status: 201 },
  );
}
