import { createAdminClient } from '@/lib/supabase/admin';
import type { BranchFlowRow, NodeStat, DropoffRow, EngagementBlob, Period, DateRange } from './types-v2';

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
