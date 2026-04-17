import type { BranchFlowRow, SankeyData } from '@/lib/admin/types-v2';

/**
 * Convert RPC rows into the shape @nivo/sankey expects.
 * Self-loops are dropped because Sankey diagrams can't visualize them
 * (they would crash the layout solver).
 */
export function buildSankeyData(rows: BranchFlowRow[]): SankeyData {
  const nodeIds = new Set<string>();
  const links: SankeyData['links'] = [];

  for (const row of rows) {
    if (row.from_node === row.to_node) continue;
    nodeIds.add(row.from_node);
    nodeIds.add(row.to_node);
    links.push({ source: row.from_node, target: row.to_node, value: row.flow_count });
  }

  return {
    nodes: Array.from(nodeIds).map((id) => ({ id })),
    links,
  };
}
