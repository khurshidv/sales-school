// Client-safe helpers. DO NOT import from queries-v2 or page-queries here —
// those are server-only.

import type {
  DailyTrendRow,
  UtmFunnelRow,
  OfferFunnel,
  Period,
  BranchFlowRow,
  NodeStat,
  DropoffRow,
  EngagementBlob,
} from './types-v2';

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
