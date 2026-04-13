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
    .from('page_events')
    .select('visitor_id, session_id, page_slug, event_data, utm_source, utm_medium, utm_campaign, device_type, browser, referrer, created_at')
    .eq('event_type', 'cta_click')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (slug) {
    query = query.eq('page_slug', slug);
  }

  const { data } = await query;

  return (data ?? []).map((row) => ({
    visitor_id: row.visitor_id,
    session_id: row.session_id,
    page_slug: row.page_slug,
    cta_id: (row.event_data as Record<string, string>)?.cta_id ?? '',
    cta_text: (row.event_data as Record<string, string>)?.cta_text ?? '',
    section: (row.event_data as Record<string, string>)?.section ?? '',
    utm_source: row.utm_source,
    utm_medium: row.utm_medium,
    utm_campaign: row.utm_campaign,
    device_type: row.device_type,
    browser: row.browser,
    referrer: row.referrer,
    created_at: row.created_at,
  }));
}

export async function getLeadCounts(): Promise<Record<string, number>> {
  const admin = createAdminClient();

  const { data } = await admin
    .from('page_events')
    .select('page_slug')
    .eq('event_type', 'cta_click');

  const counts: Record<string, number> = { all: 0 };
  for (const row of data ?? []) {
    counts.all++;
    counts[row.page_slug] = (counts[row.page_slug] ?? 0) + 1;
  }
  return counts;
}
