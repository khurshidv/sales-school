import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getDailyTrends, getUtmFunnel, getOfferFunnelData } from '@/lib/admin/queries-v2';
import { periodToRange } from '@/lib/admin/period';
import type { Period, UtmFunnelRow, DailyTrendRow } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all', 'today', 'yesterday', 'custom'];

interface OverviewTotals {
  visitors: number;
  registered: number;
  started: number;
  completed: number;
  consultations: number;
}

function totalsFromUtm(utm: UtmFunnelRow[]): OverviewTotals {
  return utm.reduce(
    (acc, r) => ({
      visitors: acc.visitors + r.visitors,
      registered: acc.registered + r.registered,
      started: acc.started + r.started,
      completed: acc.completed + r.completed,
      consultations: acc.consultations + r.consultations,
    }),
    { visitors: 0, registered: 0, started: 0, completed: 0, consultations: 0 },
  );
}

function sparksFromTrends(trends: DailyTrendRow[]) {
  return {
    visitors: [] as number[],       // trend doesn't include visitors yet
    registered: trends.map(t => t.registered),
    started: trends.map(t => t.game_started),
    completed: trends.map(t => t.game_completed),
    consultations: [] as number[],  // trend doesn't include consultations yet
  };
}

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

  // Compute prev-period range only when both bounds are known
  let prevRange: { from: string; to: string } | null = null;
  if (range.from !== null) {
    const fromMs = new Date(range.from).getTime();
    const toMs = range.to !== null ? new Date(range.to).getTime() : Date.now();
    const span = toMs - fromMs;
    prevRange = {
      from: new Date(fromMs - span).toISOString(),
      to: new Date(fromMs - 1).toISOString(),
    };
  }

  const [trends, utm, offer, prevUtm] = await Promise.all([
    getDailyTrends(range),
    getUtmFunnel(range),
    getOfferFunnelData(range),
    prevRange ? getUtmFunnel(prevRange) : Promise.resolve(null),
  ]);

  const current = totalsFromUtm(utm);
  const prev = prevUtm !== null ? totalsFromUtm(prevUtm) : null;
  const sparks = sparksFromTrends(trends);

  return NextResponse.json({ current, prev, trends, utm, offer, sparks });
}
