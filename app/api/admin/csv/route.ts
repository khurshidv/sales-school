import { NextRequest, NextResponse } from 'next/server';
import { getPlayersEnriched } from '@/lib/admin/queries-v2';
import { getLeaderboard, type LeaderboardPeriod, type LeaderboardSort } from '@/lib/admin/leaderboard-queries';
import { requireAdmin } from '@/lib/admin/authGuard';

export const dynamic = 'force-dynamic';

const LEADERBOARD_PERIODS: LeaderboardPeriod[] = ['week', 'month', 'all'];
const LEADERBOARD_SORTS: LeaderboardSort[] = ['total_score', 'completion_time', 's_rating_count'];

function csvEscape(value: unknown): string {
  if (value == null) return '';
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(headers: string[], rows: Array<Record<string, unknown>>): string {
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => csvEscape(r[h])).join(','));
  }
  return lines.join('\n');
}

async function buildParticipantsCsv(): Promise<string> {
  const { players } = await getPlayersEnriched({ limit: 10_000 });
  const headers = [
    'created_at', 'display_name', 'phone', 'best_rating', 'days_completed',
    'total_score', 'level', 'utm_source', 'utm_medium', 'utm_campaign',
    'referrer', 'last_activity',
  ];
  return rowsToCsv(
    headers,
    players.map((p) => ({
      created_at: p.created_at,
      display_name: p.display_name,
      phone: p.phone,
      best_rating: p.best_rating ?? '',
      days_completed: p.days_completed,
      total_score: p.total_score,
      level: p.level,
      utm_source: p.utm_source ?? '',
      utm_medium: p.utm_medium ?? '',
      utm_campaign: p.utm_campaign ?? '',
      referrer: p.referrer ?? '',
      last_activity: p.last_activity ?? '',
    })),
  );
}

async function buildLeaderboardCsv(opts: { period: LeaderboardPeriod; sort: LeaderboardSort; limit: number; offset: number }): Promise<string> {
  const { items } = await getLeaderboard(opts);
  const headers = ['rank', 'display_name', 'best_rating', 'total_score', 'level', 's_rating_count', 'scenarios_completed', 'avg_completion_seconds'];
  return rowsToCsv(
    headers,
    items.map((r, i) => ({
      rank: opts.offset + i + 1,
      display_name: r.display_name,
      best_rating: r.best_rating ?? '',
      total_score: r.total_score,
      level: r.level,
      s_rating_count: r.s_rating_count,
      scenarios_completed: r.scenarios_completed,
      avg_completion_seconds: r.avg_completion_seconds ?? '',
    })),
  );
}

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  let csv: string;
  let filename: string;
  if (type === 'participants') {
    csv = await buildParticipantsCsv();
    filename = `participants-${new Date().toISOString().slice(0, 10)}.csv`;
  } else if (type === 'leaderboard') {
    const period = (searchParams.get('period') ?? 'all') as LeaderboardPeriod;
    if (!LEADERBOARD_PERIODS.includes(period)) {
      return NextResponse.json({ error: 'invalid period' }, { status: 400 });
    }
    const sort = (searchParams.get('sort') ?? 'total_score') as LeaderboardSort;
    if (!LEADERBOARD_SORTS.includes(sort)) {
      return NextResponse.json({ error: 'invalid sort' }, { status: 400 });
    }
    const limit = Math.min(1000, Math.max(10, Number(searchParams.get('limit') ?? 500)));
    const offset = Math.max(0, Number(searchParams.get('offset') ?? 0));
    csv = await buildLeaderboardCsv({ period, sort, limit, offset });
    filename = `leaderboard-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
  } else {
    return NextResponse.json({ error: 'Invalid type. Use ?type=participants or ?type=leaderboard' }, { status: 400 });
  }

  const body = '\uFEFF' + csv;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
