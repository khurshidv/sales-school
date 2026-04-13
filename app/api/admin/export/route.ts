import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const escape = (val: unknown) => {
    const str = val == null ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  // Auth check
  const password = process.env.ADMIN_PASSWORD;
  if (password) {
    const session = req.cookies.get('admin_session')?.value;
    if (session !== password) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const type = req.nextUrl.searchParams.get('type');
  const admin = createAdminClient();
  let csv = '';
  let filename = 'export.csv';

  switch (type) {
    case 'leads': {
      const { data } = await admin
        .from('leads')
        .select('name, phone, source_page, utm_source, utm_medium, utm_campaign, device_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5000);
      csv = toCsv(
        ['name', 'phone', 'source_page', 'utm_source', 'utm_medium', 'utm_campaign', 'device_type', 'created_at'],
        data ?? [],
      );
      filename = 'leads.csv';
      break;
    }
    case 'participants': {
      const { data } = await admin
        .from('players')
        .select('display_name, phone, utm_source, utm_medium, utm_campaign, referrer, created_at')
        .order('created_at', { ascending: false })
        .limit(5000);
      csv = toCsv(
        ['display_name', 'phone', 'utm_source', 'utm_medium', 'utm_campaign', 'referrer', 'created_at'],
        data ?? [],
      );
      filename = 'participants.csv';
      break;
    }
    case 'leaderboard': {
      const { data } = await admin
        .from('leaderboard')
        .select('display_name, total_score, scenarios_completed, level, updated_at')
        .order('total_score', { ascending: false })
        .limit(500);
      csv = toCsv(
        ['display_name', 'total_score', 'scenarios_completed', 'level', 'updated_at'],
        data ?? [],
      );
      filename = 'leaderboard.csv';
      break;
    }
    default:
      return NextResponse.json({ error: 'Invalid type. Use: leads, participants, leaderboard' }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
