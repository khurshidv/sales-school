import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getOfferSegmentBreakdown, type OfferSegmentField } from '@/lib/admin/offer-queries';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

const VALID_FIELDS: OfferSegmentField[] = ['device_type', 'browser'];
const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all', 'today', 'yesterday', 'custom'];

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const sp = req.nextUrl.searchParams;
  const field = sp.get('field') as OfferSegmentField | null;
  if (!field || !VALID_FIELDS.includes(field)) {
    return NextResponse.json({ error: 'invalid field' }, { status: 400 });
  }
  const period = (sp.get('period') ?? '30d') as Period;
  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json({ error: 'invalid period' }, { status: 400 });
  }
  const from = sp.get('from');
  const to = sp.get('to');
  const range = periodToRange(period === 'custom' ? { period, from, to } : period);
  const rows = await getOfferSegmentBreakdown(field, range);
  return NextResponse.json({ rows });
}
