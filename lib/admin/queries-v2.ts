import { createAdminClient } from '@/lib/supabase/admin';
import type { BranchFlowRow, NodeStat, DropoffRow, EngagementBlob, Period, DateRange, UtmFunnelRow, DailyTrendRow, OfferFunnel, OfferBreakdownRow } from './types-v2';

interface ScenarioRange {
  scenarioId: string;
  from: string | null;
  to: string | null;
}
interface ScenarioDayRange extends ScenarioRange {
  dayId: string;
}

export async function getBranchFlow(args: ScenarioDayRange): Promise<BranchFlowRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_branch_flow', {
    p_scenario_id: args.scenarioId,
    p_day_id: args.dayId,
    p_from: args.from,
    p_to: args.to,
  });
  if (error) {
    console.warn('[queries-v2] get_branch_flow', error.message);
    return [];
  }
  return (data ?? []).map((r: { from_node: string; to_node: string; flow_count: string | number }) => ({
    from_node: r.from_node,
    to_node: r.to_node,
    flow_count: Number(r.flow_count),
  }));
}

export async function getNodeStats(args: ScenarioDayRange): Promise<NodeStat[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_node_stats', {
    p_scenario_id: args.scenarioId,
    p_day_id: args.dayId,
    p_from: args.from,
    p_to: args.to,
  });
  if (error) {
    console.warn('[queries-v2] get_node_stats', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    node_id: string;
    entered_count: string | number;
    avg_thinking_time_ms: string | number | null;
    exit_count: string | number;
  }) => ({
    node_id: r.node_id,
    entered_count: Number(r.entered_count),
    avg_thinking_time_ms: r.avg_thinking_time_ms != null ? Number(r.avg_thinking_time_ms) : 0,
    exit_count: Number(r.exit_count),
  }));
}

export async function getDropoffZones(args: ScenarioRange): Promise<DropoffRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_dropoff_zones', {
    p_scenario_id: args.scenarioId,
    p_from: args.from,
    p_to: args.to,
  });
  if (error) {
    console.warn('[queries-v2] get_dropoff_zones', error.message);
    return [];
  }
  return (data ?? []).map((r: { node_id: string; day_id: string; dropoff_count: string | number }) => ({
    node_id: r.node_id,
    day_id: r.day_id,
    dropoff_count: Number(r.dropoff_count),
  }));
}

export async function getEngagementIndexRaw(args: ScenarioRange): Promise<EngagementBlob> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_engagement_index', {
    p_scenario_id: args.scenarioId,
    p_from: args.from,
    p_to: args.to,
  });
  if (error) {
    console.warn('[queries-v2] get_engagement_index', error.message);
    return { completion_rate: 0, avg_thinking_time_ms: null, replay_rate: 0 };
  }
  const blob = data as EngagementBlob | null;
  return blob ?? { completion_rate: 0, avg_thinking_time_ms: null, replay_rate: 0 };
}

export function periodToRange(period: Period, now: Date = new Date()): DateRange {
  if (period === 'all') return { from: null, to: null };
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: null };
}

// ---- Marketing (Phase 3) ----

interface DateRangeOnly {
  from: string | null;
  to: string | null;
}

export async function getUtmFunnel(args: DateRangeOnly): Promise<UtmFunnelRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_utm_funnel', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_utm_funnel', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    utm_source: string; visitors: string | number; registered: string | number;
    started: string | number; completed: string | number;
  }) => ({
    utm_source: r.utm_source,
    visitors: Number(r.visitors),
    registered: Number(r.registered),
    started: Number(r.started),
    completed: Number(r.completed),
  }));
}

export async function getDailyTrends(args: DateRangeOnly): Promise<DailyTrendRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_daily_trends', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_daily_trends', error.message);
    return [];
  }
  return (data ?? []).map((r: {
    bucket_date: string; registered: string | number;
    game_started: string | number; game_completed: string | number;
  }) => ({
    bucket_date: r.bucket_date,
    registered: Number(r.registered),
    game_started: Number(r.game_started),
    game_completed: Number(r.game_completed),
  }));
}

const ZERO_OFFER_FUNNEL: OfferFunnel = {
  game_completed: 0, offer_view: 0, offer_cta_click: 0, offer_conversion: 0,
};

export async function getOfferFunnelData(args: DateRangeOnly): Promise<OfferFunnel> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_offer_funnel', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_offer_funnel', error.message);
    return ZERO_OFFER_FUNNEL;
  }
  if (!data) return ZERO_OFFER_FUNNEL;
  return {
    game_completed: Number((data as OfferFunnel).game_completed) || 0,
    offer_view: Number((data as OfferFunnel).offer_view) || 0,
    offer_cta_click: Number((data as OfferFunnel).offer_cta_click) || 0,
    offer_conversion: Number((data as OfferFunnel).offer_conversion) || 0,
  };
}

export async function getOfferBreakdownByRating(args: DateRangeOnly): Promise<OfferBreakdownRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_offer_breakdown_by_rating', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_offer_breakdown_by_rating', error.message);
    return [];
  }
  return (data ?? []).map((r: { rating: string; views: string | number; clicks: string | number }) => ({
    segment: r.rating,
    views: Number(r.views),
    clicks: Number(r.clicks),
  }));
}

export async function getOfferBreakdownByUtm(args: DateRangeOnly): Promise<OfferBreakdownRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_offer_breakdown_by_utm', { p_from: args.from, p_to: args.to });
  if (error) {
    console.warn('[queries-v2] get_offer_breakdown_by_utm', error.message);
    return [];
  }
  return (data ?? []).map((r: { utm_source: string; views: string | number; clicks: string | number }) => ({
    segment: r.utm_source,
    views: Number(r.views),
    clicks: Number(r.clicks),
  }));
}
