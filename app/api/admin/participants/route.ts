import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getPlayersEnriched } from '@/lib/admin/queries-v2';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const search = sp.get('search') || undefined;
  const limitRaw = sp.get('limit');
  const limit = limitRaw ? Math.min(Math.max(1, Number(limitRaw)), 10_000) : 100;

  // Period filter
  const period = (sp.get('period') ?? '30d') as Period;
  const fromParam = sp.get('from');
  const toParam = sp.get('to');
  const range = periodToRange({ period, from: fromParam, to: toParam });

  // UTM multi-select (comma-separated)
  const utmSource = sp.get('utm_source')?.split(',').filter(Boolean) ?? [];
  const utmCampaign = sp.get('utm_campaign')?.split(',').filter(Boolean) ?? [];

  // Has-lead toggle
  const hasLeadRaw = sp.get('has_lead');
  const hasLead: boolean | null =
    hasLeadRaw === 'true' ? true : hasLeadRaw === 'false' ? false : null;

  // Status multi-select (comma-separated)
  const status = sp.get('status')?.split(',').filter(Boolean) ?? [];

  // Rating multi-select (comma-separated) — replaces legacy ratingFilter
  const ratingsRaw = sp.get('ratings');
  const ratings = ratingsRaw ? ratingsRaw.split(',').filter(Boolean) : [];
  // Legacy single-value fallback
  const ratingFilter = ratings.length === 0 ? (sp.get('ratingFilter') || null) : null;

  const result = await getPlayersEnriched({
    search,
    limit,
    ratingFilter,
    ratings,
    from: range.from,
    to: range.to,
    utmSource,
    utmCampaign,
    hasLead,
    status,
  });
  return NextResponse.json(result);
}
