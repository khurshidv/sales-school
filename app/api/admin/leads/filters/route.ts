import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const admin = createAdminClient();
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await admin
    .from('leads')
    .select('utm_source, utm_medium, utm_campaign')
    .gte('created_at', since)
    .limit(5000);

  const sources = new Set<string>();
  const mediums = new Set<string>();
  const campaigns = new Set<string>();
  for (const r of data ?? []) {
    if (r.utm_source) sources.add(r.utm_source);
    if (r.utm_medium) mediums.add(r.utm_medium);
    if (r.utm_campaign) campaigns.add(r.utm_campaign);
  }
  return NextResponse.json({
    sources: Array.from(sources).sort(),
    mediums: Array.from(mediums).sort(),
    campaigns: Array.from(campaigns).sort(),
  });
}
