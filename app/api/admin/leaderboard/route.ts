import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getLeaderboard, type LeaderboardPeriod, type LeaderboardSort } from '@/lib/admin/leaderboard-queries';

export const dynamic = 'force-dynamic';

const PERIODS: LeaderboardPeriod[] = ['week', 'month', 'all'];
const SORTS: LeaderboardSort[] = ['total_score', 'completion_time', 's_rating_count'];

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const period = (sp.get('period') ?? 'all') as LeaderboardPeriod;
  if (!PERIODS.includes(period)) return NextResponse.json({ error: 'invalid period' }, { status: 400 });
  const sort = (sp.get('sort') ?? 'total_score') as LeaderboardSort;
  if (!SORTS.includes(sort)) return NextResponse.json({ error: 'invalid sort' }, { status: 400 });
  const limit = Math.min(100, Math.max(10, Number(sp.get('limit') ?? 50)));
  const offset = Math.max(0, Number(sp.get('offset') ?? 0));
  const scenarioId = sp.get('scenarioId');

  const { items, total } = await getLeaderboard({
    period, sort, limit, offset, scenarioId: scenarioId || null,
  });
  return NextResponse.json({ items, total, period, sort, limit, offset });
}
