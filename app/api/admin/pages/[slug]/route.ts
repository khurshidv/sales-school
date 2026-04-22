import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getPageAnalytics, getPageTitleFromRegistry, getConversionPerDevice } from '@/lib/admin/page-queries';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all', 'today', 'yesterday', 'custom'];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { slug } = await params;
  const sp = req.nextUrl.searchParams;
  const period = (sp.get('period') ?? '30d') as Period;
  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json({ error: 'invalid period' }, { status: 400 });
  }
  const fromQ = sp.get('from');
  const toQ = sp.get('to');
  const range = periodToRange(period === 'custom' ? { period, from: fromQ, to: toQ } : period);

  const from = range.from ? new Date(range.from) : new Date(Date.now() - 30 * 86_400_000);
  const to = range.to ? new Date(range.to) : new Date();

  const [analytics, registry, deviceConversion] = await Promise.all([
    getPageAnalytics(slug, from, to),
    getPageTitleFromRegistry(slug),
    getConversionPerDevice(slug, from, to),
  ]);

  return NextResponse.json({
    slug,
    title: registry.title,
    annotations: registry.annotations,
    summary: analytics.summary,
    breakdowns: analytics.breakdowns,
    device_conversion: deviceConversion,
  });
}
