import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getLeads } from '@/lib/admin/page-queries';
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

  const utmSourceRaw = sp.get('utm_source')?.split(',').filter(Boolean);
  const utmCampaignRaw = sp.get('utm_campaign')?.split(',').filter(Boolean);

  const { leads } = await getLeads({
    slug: sp.get('slug') ?? undefined,
    search: sp.get('search') ?? undefined,
    status: sp.get('status') ?? undefined,
    utmSource: utmSourceRaw && utmSourceRaw.length ? utmSourceRaw : undefined,
    utmCampaign: utmCampaignRaw && utmCampaignRaw.length ? utmCampaignRaw : undefined,
    from: range.from ?? undefined,
    to: range.to ?? undefined,
    limit: 10_000,
    sortBy: 'created_at',
    sortAsc: false,
  });

  const header = [
    'Дата',
    'Имя',
    'Телефон',
    'Страница',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'Устройство',
    'Статус',
    'Assigned To',
    'Bitrix Deal ID',
    'Bitrix Contact ID',
  ];
  const rows = leads.map(l => [
    new Date(l.created_at).toISOString(),
    l.name,
    l.phone,
    l.source_page,
    l.utm_source ?? '',
    l.utm_medium ?? '',
    l.utm_campaign ?? '',
    l.device_type ?? '',
    l.status ?? 'new',
    l.assigned_to ?? '',
    l.bitrix_deal_id ?? '',
    l.bitrix_contact_id ?? '',
  ]);

  const csvBody = [header, ...rows].map(r => r.map(csvEscape).join(',')).join('\n');

  const today = new Date().toISOString().slice(0, 10);
  return new Response('\uFEFF' + csvBody, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
