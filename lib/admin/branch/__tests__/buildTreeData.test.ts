import { describe, it, expect } from 'vitest';
import { buildTreeData } from '@/lib/admin/branch/buildTreeData';

describe('buildTreeData', () => {
  it('returns empty array for empty input', () => {
    expect(buildTreeData([], 'root')).toEqual([]);
  });

  it('builds a 2-level tree from a single root', () => {
    const tree = buildTreeData(
      [
        { from_node: 'root', to_node: 'a', flow_count: 10 },
        { from_node: 'root', to_node: 'b', flow_count: 5 },
        { from_node: 'a', to_node: 'leaf', flow_count: 7 },
      ],
      'root',
    );
    expect(tree).toEqual([
      {
        id: 'a', count: 10, children: [
          { id: 'leaf', count: 7, children: [] },
        ],
      },
      { id: 'b', count: 5, children: [] },
    ]);
  });

  it('caps recursion at maxDepth to avoid cycles', () => {
    const tree = buildTreeData(
      [
        { from_node: 'a', to_node: 'b', flow_count: 1 },
        { from_node: 'b', to_node: 'a', flow_count: 1 },
      ],
      'a',
      2,
    );
    expect(tree).toEqual([
      { id: 'b', count: 1, children: [{ id: 'a', count: 1, children: [] }] },
    ]);
  });
});
