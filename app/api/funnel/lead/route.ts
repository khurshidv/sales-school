import { NextResponse, after } from 'next/server';
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

  const leadRes = await admin
    .from('leads')
    .insert(buildLeadDbRow(body, funnelToken))
    .select('id, funnel_token')
    .single();

  if (leadRes.error || !leadRes.data) {
    return NextResponse.json({ error: 'lead_insert_failed' }, { status: 500 });
  }

  const leadId = leadRes.data.id as string;

  // Progress row must land before the redirect — without it /api/funnel/state 404s.
  const progressInsert = await admin.from('funnel_progress').insert({ lead_id: leadId });
  if (progressInsert.error) {
    return NextResponse.json({ error: 'progress_insert_failed' }, { status: 500 });
  }

  // Non-critical: Bitrix forward + analytics event fire after the response.
  // Vercel keeps the lambda alive for `after()` callbacks.
  const forwardBody = buildBitrixForwardBody(body);
  const forwardUrl = new URL('/api/bitrix/lead', request.url).toString();
  after(async () => {
    try {
      await fetch(forwardUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(forwardBody),
      });
    } catch (err) {
      console.error('[funnel/lead] bitrix forward failed (non-fatal):', err);
    }
  });
  after(async () => {
    try {
      await admin.from('funnel_events').insert({
        lead_id: leadId,
        event_type: 'lead_created',
        lesson_index: null,
        meta: {},
      });
    } catch (err) {
      console.error('[funnel/lead] event log failed (non-fatal):', err);
    }
  });

  return NextResponse.json(
    {
      lead_id: leadId,
      token: leadRes.data.funnel_token,
      next_url: '/start/dars/1',
    },
    { status: 201 },
  );
}
