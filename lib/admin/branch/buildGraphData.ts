import type { BranchFlowRow, NodeStat, DropoffRow, GraphData } from '@/lib/admin/types-v2';

const HIGH_THINKING_MS = 15_000;

/**
 * Build force-graph data with semantic node groups:
 *   - fail    : node appears in drop-off zones list
 *   - warn    : avg thinking time above HIGH_THINKING_MS (likely confusing)
 *   - success : visited and most players moved on
 *   - neutral : no entries at all (orphan node — usually data gap)
 */
export function buildGraphData(
  flows: BranchFlowRow[],
  stats: NodeStat[],
  dropoffs: DropoffRow[],
): GraphData {
  const dropoffIds = new Set(dropoffs.map((d) => d.node_id));

  const nodes: GraphData['nodes'] = stats.map((s) => {
    let group: GraphData['nodes'][number]['group'];
    if (dropoffIds.has(s.node_id)) group = 'fail';
    else if (s.avg_thinking_time_ms > HIGH_THINKING_MS) group = 'warn';
    else if (s.entered_count > 0) group = 'success';
    else group = 'neutral';
    return { id: s.node_id, size: s.entered_count, group };
  });

  const links: GraphData['links'] = flows.map((f) => ({
    source: f.from_node,
    target: f.to_node,
    value: f.flow_count,
  }));

  return { nodes, links };
}
