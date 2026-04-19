import type { BranchFlowRow, SankeyData } from '@/lib/admin/types-v2';

/**
 * Remove edges that would create cycles in the directed graph.
 * Processes edges in descending value order so high-traffic paths are always
 * kept; low-traffic back-navigation edges are dropped.
 * Uses DFS reachability: if target can already reach source, the edge is cyclic.
 */
function removeCycleEdges(
  links: Array<{ source: string; target: string; value: number }>,
): Array<{ source: string; target: string; value: number }> {
  const sorted = [...links].sort((a, b) => b.value - a.value);
  const adjacency = new Map<string, Set<string>>();
  const result: typeof links = [];

  function canReach(from: string, target: string): boolean {
    const visited = new Set<string>();
    const stack = [from];
    while (stack.length > 0) {
      const cur = stack.pop()!;
      if (cur === target) return true;
      if (visited.has(cur)) continue;
      visited.add(cur);
      for (const neighbor of adjacency.get(cur) ?? []) {
        stack.push(neighbor);
      }
    }
    return false;
  }

  for (const link of sorted) {
    // Skip if adding source→target would create a cycle
    if (canReach(link.target, link.source)) continue;
    if (!adjacency.has(link.source)) adjacency.set(link.source, new Set());
    adjacency.get(link.source)!.add(link.target);
    result.push(link);
  }

  return result;
}

/**
 * Convert RPC rows into the shape @nivo/sankey expects.
 * Self-loops are dropped because Sankey diagrams can't visualize them.
 * Cyclic edges (back-navigation) are also removed — they crash Nivo's
 * layout solver. High-traffic edges are always kept over low-traffic ones.
 */
export function buildSankeyData(rows: BranchFlowRow[]): SankeyData {
  const rawLinks: Array<{ source: string; target: string; value: number }> = [];

  for (const row of rows) {
    if (row.from_node === row.to_node) continue;
    rawLinks.push({ source: row.from_node, target: row.to_node, value: row.flow_count });
  }

  const links = removeCycleEdges(rawLinks);

  // Only include nodes that appear in at least one kept link
  const nodeIds = new Set<string>();
  for (const l of links) {
    nodeIds.add(l.source);
    nodeIds.add(l.target);
  }

  return {
    nodes: Array.from(nodeIds).map((id) => ({ id })),
    links,
  };
}
