import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { bulkUpdateParticipants, type ParticipantStatus } from '@/lib/admin/participant-queries';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: ParticipantStatus[] = ['new', 'in_progress', 'done', 'hire', 'skip'];

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const parsed = body as { ids?: unknown; action?: unknown; value?: unknown };

  if (!Array.isArray(parsed.ids) || parsed.ids.length === 0) {
    return NextResponse.json({ error: 'no ids' }, { status: 400 });
  }

  const ids = parsed.ids.filter(
    (x): x is string => typeof x === 'string' && x.length > 0,
  );
  if (ids.length === 0) {
    return NextResponse.json({ error: 'no valid ids' }, { status: 400 });
  }

  if (parsed.action === 'status') {
    if (
      typeof parsed.value !== 'string' ||
      !(VALID_STATUSES as readonly string[]).includes(parsed.value)
    ) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    }
    try {
      const updated = await bulkUpdateParticipants(ids, {
        status: parsed.value as ParticipantStatus,
      });
      return NextResponse.json({ updated });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  if (parsed.action === 'assign') {
    if (typeof parsed.value !== 'string') {
      return NextResponse.json({ error: 'invalid assignee' }, { status: 400 });
    }
    try {
      const updated = await bulkUpdateParticipants(ids, {
        assigned_to: parsed.value,
      });
      return NextResponse.json({ updated });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 });
}
