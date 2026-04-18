import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getPagesSummary } from '@/lib/admin/page-queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const fromRaw = sp.get('from');
  const toRaw = sp.get('to');
  const from = fromRaw ? new Date(fromRaw) : new Date(Date.now() - 30 * 86_400_000);
  const to = toRaw ? new Date(toRaw) : new Date();

  // Reject obviously-bad inputs (NaN from new Date('garbage'))
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json({ error: 'invalid from/to' }, { status: 400 });
  }

  const pages = await getPagesSummary(from, to);
  return NextResponse.json({ pages });
}
