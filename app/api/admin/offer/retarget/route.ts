import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { createAdminClient } from '@/lib/supabase/admin';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all', 'today', 'yesterday', 'custom'];

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const period = (sp.get('period') ?? '30d') as Period;
  if (!VALID_PERIODS.includes(period)) {
    return new Response('invalid period', { status: 400 });
  }
  const from = sp.get('from');
  const to = sp.get('to');
  const range = periodToRange(period === 'custom' ? { period, from, to } : period);

  const admin = createAdminClient();

  // 1. Players who VIEWED the offer in period
  let viewersQuery = admin
    .from('offer_events')
    .select('player_id, created_at')
    .eq('event_type', 'offer_view')
    .not('player_id', 'is', null);
  if (range.from) viewersQuery = viewersQuery.gte('created_at', range.from);
  if (range.to) viewersQuery = viewersQuery.lte('created_at', range.to);
  const { data: viewerRows } = await viewersQuery.limit(10_000);

  const viewerIds = Array.from(new Set((viewerRows ?? []).map(r => r.player_id as string).filter(Boolean)));

  // Track last_view per player
  const lastViewByPlayer = new Map<string, string>();
  for (const row of viewerRows ?? []) {
    if (!row.player_id) continue;
    const prev = lastViewByPlayer.get(row.player_id);
    if (!prev || new Date(row.created_at) > new Date(prev)) {
      lastViewByPlayer.set(row.player_id, row.created_at);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  if (viewerIds.length === 0) {
    const csv = '\uFEFFТелефон,Имя,UTM Source,UTM Campaign,Последний просмотр\n';
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="retarget-${today}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  // 2. Players with ANY click or conversion (ever) — to exclude
  const { data: clickerRows } = await admin
    .from('offer_events')
    .select('player_id')
    .in('event_type', ['offer_cta_click', 'offer_conversion'])
    .in('player_id', viewerIds);
  const excluded = new Set<string>((clickerRows ?? []).map(r => r.player_id as string));
  const retargetIds = viewerIds.filter(id => !excluded.has(id));

  // 3. Fetch player details
  const { data: playersRows } = await admin
    .from('players')
    .select('id, phone, display_name, utm_source, utm_campaign')
    .in('id', retargetIds);

  const rows = (playersRows ?? []).map(p => [
    p.phone,
    p.display_name ?? '',
    p.utm_source ?? '',
    p.utm_campaign ?? '',
    lastViewByPlayer.get(p.id) ?? '',
  ]);

  const header = ['Телефон', 'Имя', 'UTM Source', 'UTM Campaign', 'Последний просмотр'];
  const csvBody = [header, ...rows].map(r => r.map(csvEscape).join(',')).join('\n');

  return new Response('\uFEFF' + csvBody, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="retarget-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
