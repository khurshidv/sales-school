// Client-safe helpers. DO NOT import from queries-v2 or page-queries here —
// those are server-only.

import type {
  DailyTrendRow,
  UtmFunnelRow,
  OfferFunnel,
  OfferBreakdownRow,
  Period,
  BranchFlowRow,
  NodeStat,
  DropoffRow,
  EngagementBlob,
  EnrichedPlayer,
  PlayerSummary,
  PlayerJourneyEvent,
  CompletedDay,
} from './types-v2';
import type { PeriodParamState } from './usePeriodParam';
import type { PageSummary, PageBreakdowns, Lead } from './types';

/** Extract period + optional from/to into flat query params. */
function periodParams(p: Period | PeriodParamState): Record<string, string | null | undefined> {
  if (typeof p === 'string') return { period: p };
  return {
    period: p.period,
    ...(p.period === 'custom' ? { from: p.from, to: p.to } : {}),
  };
}

// NOTE: LeaderboardItem is defined in server-only queries-v2.ts. We mirror the
// shape here so the client bundle never reaches into server code.
export interface LeaderboardItem {
  player_id: string;
  display_name: string;
  total_score: number;
  scenarios_completed: number;
  level: number;
  best_rating: string | null;
  updated_at: string;
}

// NOTE: RealtimeKpis and RecentGameEvent are defined in server-only queries-v2.ts.
// Mirrored here so the client bundle never reaches into server code.
export interface RealtimeKpis {
  active: number;
  today: number;
  completed_today: number;
}

export interface RecentGameEvent {
  event_type: string;
  event_data: Record<string, unknown>;
  scenario_id: string | null;
  day_id: string | null;
  created_at: string;
  player_id: string;
  display_name: string | null;
}

export class AdminApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function adminGet<T>(path: string, params?: Record<string, string | number | null | undefined>): Promise<T> {
  const qs = params
    ? '?' + Object.entries(params)
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  const res = await fetch(`${path}${qs}`, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(res.status, body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export interface OverviewPayload {
  trends: DailyTrendRow[];
  utm: UtmFunnelRow[];
  offer: OfferFunnel;
}

export function fetchOverview(period: Period | PeriodParamState): Promise<OverviewPayload> {
  return adminGet<OverviewPayload>('/api/admin/overview', periodParams(period));
}

export interface BranchPayload {
  flows: BranchFlowRow[];
  stats: NodeStat[];
  dropoffs: DropoffRow[];
}

export function fetchBranch(params: {
  scenarioId: string; dayId: string; period: Period | PeriodParamState;
}): Promise<BranchPayload> {
  const { period, ...rest } = params;
  return adminGet<BranchPayload>('/api/admin/branch', { ...rest, ...periodParams(period) });
}

export interface DropoffPayload { dropoffs: DropoffRow[] }

export function fetchDropoff(params: { scenarioId: string; period: Period | PeriodParamState }): Promise<DropoffPayload> {
  const { period, ...rest } = params;
  return adminGet<DropoffPayload>('/api/admin/dropoff', { ...rest, ...periodParams(period) });
}

export interface EngagementPayload {
  engagement: EngagementBlob;
  stats: NodeStat[];
}

export function fetchEngagement(params: {
  scenarioId: string; dayId: string; period: Period | PeriodParamState;
}): Promise<EngagementPayload> {
  const { period, ...rest } = params;
  return adminGet<EngagementPayload>('/api/admin/engagement', { ...rest, ...periodParams(period) });
}

export interface FunnelPayload { utm: UtmFunnelRow[] }

export function fetchFunnel(period: Period | PeriodParamState): Promise<FunnelPayload> {
  return adminGet<FunnelPayload>('/api/admin/funnel', periodParams(period));
}

export interface OfferPayload {
  funnel: OfferFunnel;
  byRating: OfferBreakdownRow[];
  byUtm: OfferBreakdownRow[];
}

export function fetchOffer(period: Period | PeriodParamState): Promise<OfferPayload> {
  return adminGet<OfferPayload>('/api/admin/offer', periodParams(period));
}

export interface ParticipantsPayload {
  players: EnrichedPlayer[];
  total: number;
  stats: { total_sa: number; total_any_day: number; total_consultations: number };
}

export function fetchParticipants(params: {
  search?: string;
  ratingFilter?: string | null;
  limit?: number;
}): Promise<ParticipantsPayload> {
  return adminGet<ParticipantsPayload>('/api/admin/participants', {
    search: params.search,
    ratingFilter: params.ratingFilter,
    limit: params.limit,
  });
}

export interface LeaderboardPayload {
  items: LeaderboardItem[];
}

export function fetchLeaderboard(limit = 100): Promise<LeaderboardPayload> {
  return adminGet<LeaderboardPayload>('/api/admin/leaderboard', { limit });
}

export interface PlayerPayload {
  summary: PlayerSummary | null;
  journey: PlayerJourneyEvent[];
  completedDays: CompletedDay[];
}

export function fetchPlayer(playerId: string): Promise<PlayerPayload> {
  return adminGet<PlayerPayload>(`/api/admin/player/${encodeURIComponent(playerId)}`);
}

export function fetchRealtimeKpis(): Promise<RealtimeKpis> {
  return adminGet<RealtimeKpis>('/api/admin/realtime/kpis');
}

export interface RecentEventsPayload {
  events: RecentGameEvent[];
}

// `minutes` = time window (not row count). Server clamps 1..1440. Default 60.
export function fetchRecentEvents(minutes = 60): Promise<RecentEventsPayload> {
  return adminGet<RecentEventsPayload>('/api/admin/realtime/events', { minutes });
}

// ─── Pages Analytics ───

export interface PagesListPayload {
  pages: PageSummary[];
}

export interface PageAnalyticsPayload {
  summary: PageSummary;
  breakdowns: PageBreakdowns;
}

export function fetchPages(params?: { from?: string; to?: string }): Promise<PagesListPayload> {
  return adminGet<PagesListPayload>('/api/admin/pages', params);
}

export function fetchPageAnalytics(
  slug: string,
  params?: { from?: string; to?: string },
): Promise<PageAnalyticsPayload> {
  return adminGet<PageAnalyticsPayload>(`/api/admin/pages/${encodeURIComponent(slug)}`, params);
}

// ─── Leads ───

export interface LeadsPayload {
  leads: Lead[];
  total: number;
}

export interface LeadsOptions {
  slug?: string;
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: string;
  sortAsc?: boolean;
  period?: Period;
  from?: string;
  to?: string;
}

export function fetchLeads(options: LeadsOptions = {}): Promise<LeadsPayload> {
  return adminGet<LeadsPayload>('/api/admin/leads', {
    slug: options.slug,
    limit: options.limit,
    offset: options.offset,
    search: options.search,
    sortBy: options.sortBy,
    sortAsc: options.sortAsc != null ? String(options.sortAsc) : undefined,
    period: options.period,
    from: options.from,
    to: options.to,
  });
}

export function fetchLeadCounts(): Promise<Record<string, number>> {
  return adminGet<Record<string, number>>('/api/admin/leads/counts');
}

// ─── Node Labels ───

export interface NodeLabelResult {
  title: string;
  type: string;
  preview: string | null;
  dayId: string | null;
}

export async function fetchNodeLabels(
  scenarioId: string,
  ids: string[],
): Promise<Record<string, NodeLabelResult>> {
  if (ids.length === 0) return {};
  const qs = new URLSearchParams({ scenario: scenarioId, ids: ids.join(',') });
  const res = await fetch(`/api/admin/node-label?${qs}`);
  if (!res.ok) throw new Error(`node-labels fetch failed: ${res.status}`);
  const data = await res.json();
  return data.labels;
}
