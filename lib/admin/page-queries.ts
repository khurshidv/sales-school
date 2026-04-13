import { createAdminClient } from '@/lib/supabase/admin';
import type { PageSummary, PageBreakdowns, Lead } from './types';

const PAGE_SLUGS = ['home', 'target'] as const;

export async function getPagesSummary(
  from: Date,
  to: Date,
): Promise<PageSummary[]> {
  const admin = createAdminClient();

  const results = await Promise.all(
    PAGE_SLUGS.map(async (slug) => {
      const { data, error } = await admin.rpc('get_page_summary', {
        p_slug: slug,
        p_from: from.toISOString(),
        p_to: to.toISOString(),
      });

      if (error || !data) {
        return {
          page_slug: slug,
          total_views: 0,
          unique_visitors: 0,
          bounce_rate: 0,
          avg_duration_ms: 0,
          conversion_rate: 0,
        };
      }

      return {
        page_slug: slug,
        ...data,
      } as PageSummary;
    }),
  );

  return results;
}

export async function getPageAnalytics(
  slug: string,
  from: Date,
  to: Date,
): Promise<{ summary: PageSummary; breakdowns: PageBreakdowns }> {
  const admin = createAdminClient();

  const [summaryRes, breakdownsRes] = await Promise.all([
    admin.rpc('get_page_summary', {
      p_slug: slug,
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    }),
    admin.rpc('get_page_breakdowns', {
      p_slug: slug,
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    }),
  ]);

  const summary: PageSummary = summaryRes.data
    ? { page_slug: slug, ...summaryRes.data }
    : {
        page_slug: slug,
        total_views: 0,
        unique_visitors: 0,
        bounce_rate: 0,
        avg_duration_ms: 0,
        conversion_rate: 0,
      };

  const breakdowns: PageBreakdowns = breakdownsRes.data ?? {
    utm_breakdown: [],
    device_breakdown: [],
    referrer_breakdown: [],
    scroll_depth: [],
    daily_views: [],
  };

  return { summary, breakdowns };
}

export async function getLeads(
  slug?: string,
  limit = 200,
): Promise<Lead[]> {
  const admin = createAdminClient();

  let query = admin
    .from('leads')
    .select('id, name, phone, source_page, utm_source, utm_medium, utm_campaign, device_type, browser, referrer, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (slug) {
    query = query.eq('source_page', slug);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getLeadCounts(): Promise<Record<string, number>> {
  const admin = createAdminClient();

  // Use COUNT with head:true instead of fetching all rows
  const [allRes, ...pageResults] = await Promise.all([
    admin.from('leads').select('*', { count: 'exact', head: true }),
    ...PAGE_SLUGS.map((slug) =>
      admin.from('leads').select('*', { count: 'exact', head: true }).eq('source_page', slug),
    ),
  ]);

  const counts: Record<string, number> = { all: allRes.count ?? 0 };
  PAGE_SLUGS.forEach((slug, i) => {
    counts[slug] = pageResults[i].count ?? 0;
  });
  return counts;
}
