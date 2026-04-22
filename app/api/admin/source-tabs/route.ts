import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const admin = createAdminClient();

  // Distinct source_page values from leads in last 90 days. 'game' excluded
  // because end-of-game consultation requests are tracked separately.
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: rows } = await admin
    .from('leads')
    .select('source_page')
    .neq('source_page', 'game')
    .gte('created_at', since)
    .limit(2000);

  const set = new Set<string>();
  for (const r of rows ?? []) {
    if (r.source_page) set.add(r.source_page);
  }
  const slugs = Array.from(set).sort();

  // Join with pages_registry for human labels.
  let labelMap = new Map<string, string>();
  if (slugs.length > 0) {
    const { data: regs } = await admin
      .from('pages_registry')
      .select('slug, title_ru')
      .in('slug', slugs);
    for (const r of regs ?? []) labelMap.set(r.slug, r.title_ru);
  }

  const tabs = slugs.map(slug => ({ slug, label: labelMap.get(slug) ?? slug }));
  return NextResponse.json({ tabs });
}
