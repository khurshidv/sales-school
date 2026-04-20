import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeFrom, normalizeTo } from './formatters';
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
  options: {
    slug?: string;
    limit?: number;
    offset?: number;
    search?: string;
    sortBy?: string;
    sortAsc?: boolean;
    from?: string;
    to?: string;
    includeTest?: boolean;
  } = {},
): Promise<{ leads: Lead[]; total: number }> {
  const admin = createAdminClient();
  const { slug, limit = 25, offset = 0, search, sortBy = 'created_at', sortAsc = false, from, to, includeTest = false } = options;

  let query = admin
    .from('leads')
    .select('id, name, phone, source_page, utm_source, utm_medium, utm_campaign, device_type, browser, referrer, created_at, is_test', { count: 'exact' });

  if (!includeTest) query = query.eq('is_test', false);
  if (slug) {
    query = query.eq('source_page', slug);
  } else {
    // End-of-game consultation requests are tracked separately (Overview funnel
    // 'consultations' and Participants page). Excluded from the default Leads view.
    query = query.neq('source_page', 'game');
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }
  if (from) {
    query = query.gte('created_at', normalizeFrom(from));
  }
  if (to) {
    query = query.lte('created_at', normalizeTo(to));
  }

  query = query.order(sortBy, { ascending: sortAsc }).range(offset, offset + limit - 1);

  const { data, count } = await query;
  return { leads: data ?? [], total: count ?? 0 };
}

export async function getLeadCounts(includeTest = false): Promise<Record<string, number>> {
  const admin = createAdminClient();

  // `all` is home+target only — end-of-game consultations excluded by design.
  const pageResults = await Promise.all(
    PAGE_SLUGS.map((slug) => {
      let q = admin.from('leads').select('*', { count: 'exact', head: true }).eq('source_page', slug);
      if (!includeTest) q = q.eq('is_test', false);
      return q;
    }),
  );

  const counts: Record<string, number> = { all: 0 };
  PAGE_SLUGS.forEach((slug, i) => {
    const n = pageResults[i].count ?? 0;
    counts[slug] = n;
    counts.all += n;
  });
  return counts;
}
