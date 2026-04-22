import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getLeads } from '@/lib/admin/page-queries';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all', 'today', 'yesterday', 'custom'];

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const limitRaw = sp.get('limit');
  const limit = limitRaw ? Math.min(Math.max(1, Number(limitRaw)), 500) : 25;
  const offsetRaw = sp.get('offset');
  const offset = offsetRaw ? Math.max(0, Number(offsetRaw)) : 0;

  const periodRaw = sp.get('period') ?? '30d';
  const period: Period = VALID_PERIODS.includes(periodRaw as Period)
    ? (periodRaw as Period)
    : '30d';
  const fromParam = sp.get('from');
  const toParam = sp.get('to');
  const range = periodToRange(period === 'custom' ? { period, from: fromParam, to: toParam } : period);

  const result = await getLeads({
    slug: sp.get('slug') ?? undefined,
    limit,
    offset,
    search: sp.get('search') ?? undefined,
    sortBy: sp.get('sortBy') ?? 'created_at',
    sortAsc: sp.get('sortAsc') === 'true',
    from: range.from ?? undefined,
    to: range.to ?? undefined,
  });
  return NextResponse.json(result);
}
