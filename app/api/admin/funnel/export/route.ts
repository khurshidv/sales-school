import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getUtmFunnelV2, getUtmSpendRollup, VALID_UTM_DIMENSIONS, type UtmDimension } from '@/lib/admin/funnel-queries';
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
  const dimension = (sp.get('dimension') ?? 'utm_source') as UtmDimension;
  if (!VALID_UTM_DIMENSIONS.includes(dimension)) {
    return new Response('invalid dimension', { status: 400 });
  }
  const from = sp.get('from');
  const to = sp.get('to');
  const range = periodToRange(period === 'custom' ? { period, from, to } : period);
  const langRaw = sp.get('language');
  const language = langRaw === 'uz' || langRaw === 'ru' ? langRaw : null;

  const [rows, spend] = await Promise.all([
    getUtmFunnelV2(dimension, range.from, range.to, language),
    getUtmSpendRollup(range.from, range.to),
  ]);

  const spendBySource = new Map<string, number>();
  for (const s of spend) spendBySource.set(s.utm_source, s.total_kzt);

  const header = ['Сегмент', 'Визиты', 'Регистрации', 'Начали', 'Прошли', 'Заявки', 'CR %', 'Расход KZT', 'CPL KZT'];
  const dataRows = rows.map(r => {
    const cr = r.visitors > 0 ? (r.consultations / r.visitors) * 100 : 0;
    const spendKzt = dimension === 'utm_source' ? (spendBySource.get(r.segment) ?? 0) : 0;
    const cpl =
      dimension === 'utm_source' && r.consultations > 0 && spendKzt > 0
        ? spendKzt / r.consultations
        : null;
    return [
      r.segment,
      r.visitors,
      r.registered,
      r.started,
      r.completed,
      r.consultations,
      cr.toFixed(2),
      dimension === 'utm_source' ? spendKzt.toFixed(2) : '',
      cpl !== null ? cpl.toFixed(2) : '',
    ];
  });

  const csvBody = [header, ...dataRows].map(row => row.map(csvEscape).join(',')).join('\n');
  const today = new Date().toISOString().slice(0, 10);

  return new Response('\uFEFF' + csvBody, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="funnel-${dimension}-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
