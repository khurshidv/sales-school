import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { sumRevenueForPeriod } from '@/lib/bitrix/deals';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

const CATEGORY_ID = Number(process.env.BITRIX_SALES_UP_CATEGORY_ID ?? 334);
const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all', 'today', 'yesterday', 'custom'];

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const period = (sp.get('period') ?? '30d') as Period;
  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json({ error: 'invalid period' }, { status: 400 });
  }

  const from = sp.get('from');
  const to = sp.get('to');
  const range = periodToRange(period === 'custom' ? { period, from, to } : period);

  const fromDate = range.from ? new Date(range.from) : new Date(0);
  const toDate = range.to ? new Date(range.to) : new Date();

  try {
    const revenue = await sumRevenueForPeriod(fromDate, toDate, CATEGORY_ID);
    return NextResponse.json(revenue);
  } catch (e) {
    console.warn('[admin/bitrix/revenue]', e);
    // Graceful fallback — Bitrix may be unreachable; UI should not crash.
    return NextResponse.json(
      { total: 0, currency: 'UZS', deals: 0, error: 'bitrix_unavailable' },
      { status: 200 },
    );
  }
}
