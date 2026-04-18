import { NextResponse } from 'next/server';
import { getPlayersEnriched, getLeaderboardEnriched } from '@/lib/admin/queries-v2';

export const dynamic = 'force-dynamic';

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

async function buildLeaderboardCsv(): Promise<string> {
  const rows = await getLeaderboardEnriched(500);
  const headers = ['rank', 'display_name', 'best_rating', 'total_score', 'level', 'scenarios_completed', 'updated_at'];
  return rowsToCsv(
    headers,
    rows.map((r, i) => ({
      rank: i + 1,
      display_name: r.display_name,
      best_rating: r.best_rating ?? '',
      total_score: r.total_score,
      level: r.level,
      scenarios_completed: r.scenarios_completed,
      updated_at: r.updated_at,
    })),
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  let csv: string;
  let filename: string;
  if (type === 'participants') {
    csv = await buildParticipantsCsv();
    filename = `participants-${new Date().toISOString().slice(0, 10)}.csv`;
  } else if (type === 'leaderboard') {
    csv = await buildLeaderboardCsv();
    filename = `leaderboard-${new Date().toISOString().slice(0, 10)}.csv`;
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
