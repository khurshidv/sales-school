import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface PatchBody {
  playerId: string;
  notes: string;
}

const MAX_NOTES_LENGTH = 10_000;

export async function PATCH(req: Request) {
  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.playerId || typeof body.playerId !== 'string') {
    return NextResponse.json({ error: 'playerId required' }, { status: 400 });
  }
  if (typeof body.notes !== 'string') {
    return NextResponse.json({ error: 'notes must be a string' }, { status: 400 });
  }
  if (body.notes.length > MAX_NOTES_LENGTH) {
    return NextResponse.json({ error: `notes exceeds ${MAX_NOTES_LENGTH} chars` }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('players')
    .update({ admin_notes: body.notes })
    .eq('id', body.playerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
