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
