// Types for Phase 2 admin pages (Branch / Engagement / Drop-off).
// Mirrored on Postgres RPC return shapes from migration 008.

// ---- Branch Analytics ----

export interface BranchFlowRow {
  from_node: string;
  to_node: string;
  flow_count: number;
}

export interface NodeStat {
  node_id: string;
  entered_count: number;
  avg_thinking_time_ms: number;
  exit_count: number;
}

// Shape consumed by @nivo/sankey
export interface SankeyData {
  nodes: Array<{ id: string }>;
  links: Array<{ source: string; target: string; value: number }>;
}

export interface TreeNode {
  id: string;
  count: number;
  children: TreeNode[];
}

// Shape consumed by react-force-graph-2d
export interface GraphData {
  nodes: Array<{ id: string; size: number; group: 'success' | 'warn' | 'fail' | 'neutral' }>;
  links: Array<{ source: string; target: string; value: number }>;
}

// ---- Drop-off Zones ----

export interface DropoffRow {
  node_id: string;
  day_id: string;
  dropoff_count: number;
}

// ---- Engagement ----

export interface EngagementBlob {
  completion_rate: number;
  avg_thinking_time_ms: number | null;
  replay_rate: number;
}

export interface EngagementIndex {
  score: number;
  components: {
    completion: number;
    thinking: number;
    replay: number;
  };
  raw: EngagementBlob;
}

// ---- Filters ----

export type Period = '7d' | '30d' | '90d' | 'all';
export interface DateRange { from: string | null; to: string | null }

export const SCENARIOS = [
  { id: 'car-dealership', label: 'Автодилер' },
] as const;

export const DAYS = [
  { id: 'day1', label: 'День 1' },
  { id: 'day2', label: 'День 2' },
  { id: 'day3', label: 'День 3' },
] as const;

// ---- Marketing (Phase 3) ----

export interface UtmFunnelRow {
  utm_source: string;
  visitors: number;
  registered: number;
  started: number;
  completed: number;
  consultations: number;
}

export interface DailyTrendRow {
  bucket_date: string;        // ISO date YYYY-MM-DD
  registered: number;
  game_started: number;
  game_completed: number;
}

export interface OfferFunnel {
  game_completed: number;
  offer_view: number;
  offer_cta_click: number;
  offer_conversion: number;
}

export interface OfferBreakdownRow {
  segment: string;            // rating or utm_source value
  views: number;
  clicks: number;
}

export interface FunnelStep {
  label: string;
  value: number;
  pctOfPrev: number;          // 0..100, NaN-safe (0 when prev is 0)
  pctOfTop: number;
}

// ---- Player Pages (Phase 4) ----

export interface PlayerJourneyEvent {
  event_type: string;
  event_data: Record<string, unknown>;
  scenario_id: string | null;
  day_id: string | null;
  created_at: string;
}

export interface PlayerSummary {
  id: string;
  phone: string;
  display_name: string;
  avatar_id: string | null;
  level: number;
  total_xp: number;
  total_score: number;
  coins: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  device_fingerprint: string | null;
  last_seen_at: string;
  created_at: string;
  admin_notes: string;
}

export interface CompletedDay {
  scenario_id: string;
  day_id: string;
  score: number;
  rating: string;
  time_taken: number;
  completed_at: string;
}

export interface ParsedJourneyDay {
  day_id: string;
  scenario_id: string | null;
  events: PlayerJourneyEvent[];
  started_at: string | null;
  completed_at: string | null;
  outcome: 'completed' | 'failed' | 'in_progress' | 'dropped';
  choices_made: number;
  back_navigations: number;
  total_thinking_time_ms: number;
}

export interface ParsedJourney {
  days: ParsedJourneyDay[];
  totalEvents: number;
  totalSessions: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
}

export interface PlayerStrengthsWeaknesses {
  strengths: string[];
  weaknesses: string[];
  recommendation: 'hire' | 'train' | 'pass';
  recommendationReason: string;
}

export interface EnrichedPlayer extends PlayerSummary {
  best_rating: string | null;
  days_completed: number;
  last_activity: string | null;
  submitted_consultation: boolean;
}
