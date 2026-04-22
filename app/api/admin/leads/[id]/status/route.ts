import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { updateLeadStatus } from '@/lib/admin/leads-queries';

export const dynamic = 'force-dynamic';

const VALID = ['new', 'in_progress', 'done', 'invalid'] as const;
type Status = typeof VALID[number];

function isStatus(v: unknown): v is Status {
  return typeof v === 'string' && (VALID as readonly string[]).includes(v);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await ctx.params;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }

  const parsed = body as { status?: unknown; assigned_to?: unknown };
  if (!isStatus(parsed.status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }
  const assignedTo = typeof parsed.assigned_to === 'string' || parsed.assigned_to === null
    ? parsed.assigned_to
    : null;

  try {
    await updateLeadStatus(id, parsed.status, assignedTo);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
