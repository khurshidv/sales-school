import type { BranchFlowRow, TreeNode } from '@/lib/admin/types-v2';

/**
 * Build a children-tree starting from `rootId`. Depth-bounded so that
 * any cycles in the flow graph (e.g. back-navigation) cannot blow up.
 */
export function buildTreeData(
  rows: BranchFlowRow[],
  rootId: string,
  maxDepth = 8,
): TreeNode[] {
  const childrenByParent = new Map<string, BranchFlowRow[]>();
  for (const r of rows) {
    if (!childrenByParent.has(r.from_node)) childrenByParent.set(r.from_node, []);
    childrenByParent.get(r.from_node)!.push(r);
  }

  function expand(parentId: string, depth: number): TreeNode[] {
    if (depth >= maxDepth) return [];
    const direct = childrenByParent.get(parentId) ?? [];
    return direct.map((edge) => ({
      id: edge.to_node,
      count: edge.flow_count,
      children: expand(edge.to_node, depth + 1),
    }));
  }

  return expand(rootId, 0);
}
