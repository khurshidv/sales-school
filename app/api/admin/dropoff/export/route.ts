import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getDropoffRate } from '@/lib/admin/dropoff-queries';
import { resolveNodeLabel } from '@/lib/admin/nodeLabels';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';
const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all', 'today', 'yesterday', 'custom'];

function escape(v: string | number): string {
  const s = String(v);
  return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const sp = req.nextUrl.searchParams;
  const scenarioId = sp.get('scenarioId');
  if (!scenarioId) return NextResponse.json({ error: 'scenarioId required' }, { status: 400 });
  const period = (sp.get('period') ?? '30d') as Period;
  if (!VALID_PERIODS.includes(period)) return NextResponse.json({ error: 'invalid period' }, { status: 400 });
  const from = sp.get('from');
  const to = sp.get('to');
  const dayId = sp.get('day');
  const range = periodToRange(period === 'custom' ? { period, from, to } : period);
  const rows = await getDropoffRate(scenarioId, range.from, range.to, { minVisits: 20, dayId });

  const headers = ['День', 'Узел ID', 'Название', 'Тип', 'Вошли', 'Выпало', 'Rate %', 'Среднее время (сек)'];
  const lines = [headers.map(escape).join(',')];
  for (const r of rows) {
    const label = resolveNodeLabel(scenarioId, r.node_id);
    const seconds = r.avg_time_on_node_ms !== null ? (r.avg_time_on_node_ms / 1000).toFixed(1) : '';
    lines.push([
      escape(r.day_id),
      escape(r.node_id),
      escape(label.title),
      escape(label.type),
      r.entered_count,
      r.dropoff_count,
      (r.dropoff_rate * 100).toFixed(2),
      seconds,
    ].join(','));
  }
  const csv = '\ufeff' + lines.join('\n');
  const ts = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="dropoff-${scenarioId}-${ts}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
