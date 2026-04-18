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
} from './types-v2';

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

export function fetchOverview(period: Period): Promise<OverviewPayload> {
  return adminGet<OverviewPayload>('/api/admin/overview', { period });
}

export interface BranchPayload {
  flows: BranchFlowRow[];
  stats: NodeStat[];
  dropoffs: DropoffRow[];
}

export function fetchBranch(params: {
  scenarioId: string; dayId: string; period: Period;
}): Promise<BranchPayload> {
  return adminGet<BranchPayload>('/api/admin/branch', params);
}

export interface DropoffPayload { dropoffs: DropoffRow[] }

export function fetchDropoff(params: { scenarioId: string; period: Period }): Promise<DropoffPayload> {
  return adminGet<DropoffPayload>('/api/admin/dropoff', params);
}

export interface EngagementPayload {
  engagement: EngagementBlob;
  stats: NodeStat[];
}

export function fetchEngagement(params: {
  scenarioId: string; dayId: string; period: Period;
}): Promise<EngagementPayload> {
  return adminGet<EngagementPayload>('/api/admin/engagement', params);
}

export interface FunnelPayload { utm: UtmFunnelRow[] }

export function fetchFunnel(period: Period): Promise<FunnelPayload> {
  return adminGet<FunnelPayload>('/api/admin/funnel', { period });
}

export interface OfferPayload {
  funnel: OfferFunnel;
  byRating: OfferBreakdownRow[];
  byUtm: OfferBreakdownRow[];
}

export function fetchOffer(period: Period): Promise<OfferPayload> {
  return adminGet<OfferPayload>('/api/admin/offer', { period });
}

export interface ParticipantsPayload {
  players: EnrichedPlayer[];
  total: number;
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
