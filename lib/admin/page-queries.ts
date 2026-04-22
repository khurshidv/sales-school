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

export async function getPageTitle(slug: string): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('pages_registry')
    .select('title_ru')
    .eq('slug', slug)
    .maybeSingle();
  return data?.title_ru ?? slug;
}

export interface PageAnnotation {
  scroll_depth: number;
  label: string;
  tone?: 'offer' | 'cta' | 'info';
}

export interface PageRegistryInfo {
  title: string;
  annotations: PageAnnotation[];
}

export async function getPageTitleFromRegistry(slug: string): Promise<PageRegistryInfo> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('pages_registry')
    .select('title_ru, annotations')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return { title: slug, annotations: [] };
  return {
    title: (data as { title_ru: string | null }).title_ru ?? slug,
    annotations: ((data as { annotations: PageAnnotation[] | null }).annotations ?? []),
  };
}

export interface DeviceConversion {
  device_type: string;
  views: number;
  leads: number;
  cr: number;   // 0..100
}

export async function getConversionPerDevice(slug: string, from: Date, to: Date): Promise<DeviceConversion[]> {
  const sb = createAdminClient();
  const [viewsRes, leadsRes] = await Promise.all([
    sb.from('page_events').select('device_type')
      .eq('event_type', 'page_view').eq('page_slug', slug)
      .gte('created_at', from.toISOString()).lte('created_at', to.toISOString()),
    sb.from('leads').select('device_type')
      .eq('source_page', slug)
      .gte('created_at', from.toISOString()).lte('created_at', to.toISOString()),
  ]);

  const vmap = new Map<string, number>();
  for (const v of (viewsRes.data ?? []) as Array<{ device_type: string | null }>) {
    const d = v.device_type ?? 'unknown';
    vmap.set(d, (vmap.get(d) ?? 0) + 1);
  }
  const lmap = new Map<string, number>();
  for (const l of (leadsRes.data ?? []) as Array<{ device_type: string | null }>) {
    const d = l.device_type ?? 'unknown';
    lmap.set(d, (lmap.get(d) ?? 0) + 1);
  }
  const all = new Set<string>([...vmap.keys(), ...lmap.keys()]);
  return Array.from(all).map(d => {
    const v = vmap.get(d) ?? 0;
    const lc = lmap.get(d) ?? 0;
    return { device_type: d, views: v, leads: lc, cr: v > 0 ? (lc / v) * 100 : 0 };
  }).sort((a, b) => b.views - a.views);
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
    status?: string;
    utmSource?: string[];
    utmCampaign?: string[];
  } = {},
): Promise<{ leads: Lead[]; total: number }> {
  const admin = createAdminClient();
  const { slug, limit = 25, offset = 0, search, sortBy = 'created_at', sortAsc = false, from, to, includeTest = false, status, utmSource, utmCampaign } = options;

  let query = admin
    .from('leads')
    .select('id, name, phone, source_page, utm_source, utm_medium, utm_campaign, device_type, browser, referrer, created_at, is_test, status, assigned_to, bitrix_deal_id, bitrix_contact_id', { count: 'exact' });

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
  if (status) {
    query = query.eq('status', status);
  }
  if (utmSource && utmSource.length > 0) query = query.in('utm_source', utmSource);
  if (utmCampaign && utmCampaign.length > 0) query = query.in('utm_campaign', utmCampaign);
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
