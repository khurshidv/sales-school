import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getLeadDedupCounts, getLinkedPlayerByPhone } from '@/lib/admin/leads-queries';

export const dynamic = 'force-dynamic';

const MAX_PHONES = 500;

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const phones = (body as { phones?: unknown })?.phones;
  if (!Array.isArray(phones)) {
    return NextResponse.json({ error: 'phones must be an array' }, { status: 400 });
  }

  const cleanPhones = phones
    .filter((p): p is string => typeof p === 'string' && p.length > 0)
    .slice(0, MAX_PHONES);

  const [dedup, players] = await Promise.all([
    getLeadDedupCounts(cleanPhones),
    getLinkedPlayerByPhone(cleanPhones),
  ]);

  return NextResponse.json({ dedup, players });
}
