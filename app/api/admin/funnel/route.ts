import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getUtmFunnelV2, getUtmSpendRollup, VALID_UTM_DIMENSIONS, type UtmDimension } from '@/lib/admin/funnel-queries';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all', 'today', 'yesterday', 'custom'];

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const period = (sp.get('period') ?? '30d') as Period;
  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json({ error: 'invalid period' }, { status: 400 });
  }
  const dimension = (sp.get('dimension') ?? 'utm_source') as UtmDimension;
  if (!VALID_UTM_DIMENSIONS.includes(dimension)) {
    return NextResponse.json({ error: 'invalid dimension' }, { status: 400 });
  }
  const from = sp.get('from');
  const to = sp.get('to');
  const range = periodToRange(period === 'custom' ? { period, from, to } : period);

  const [rows, spend] = await Promise.all([
    getUtmFunnelV2(dimension, range.from, range.to),
    getUtmSpendRollup(range.from, range.to),
  ]);

  return NextResponse.json({ rows, spend, dimension });
}
