import { describe, it, expect } from 'vitest';
import { buildSankeyData } from '@/lib/admin/branch/buildSankeyData';

describe('buildSankeyData', () => {
  it('returns empty data for empty input', () => {
    expect(buildSankeyData([])).toEqual({ nodes: [], links: [] });
  });

  it('produces unique nodes and one link per row', () => {
    const data = buildSankeyData([
      { from_node: 'a', to_node: 'b', flow_count: 5 },
      { from_node: 'a', to_node: 'c', flow_count: 3 },
      { from_node: 'b', to_node: 'd', flow_count: 5 },
    ]);
    expect(data.nodes.map((n) => n.id).sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(data.links).toEqual([
      { source: 'a', target: 'b', value: 5 },
      { source: 'a', target: 'c', value: 3 },
      { source: 'b', target: 'd', value: 5 },
    ]);
  });

  it('drops self-loops to prevent Sankey crashes', () => {
    const data = buildSankeyData([
      { from_node: 'a', to_node: 'a', flow_count: 1 },
      { from_node: 'a', to_node: 'b', flow_count: 2 },
    ]);
    expect(data.links).toEqual([{ source: 'a', target: 'b', value: 2 }]);
    expect(data.nodes).toEqual([{ id: 'a' }, { id: 'b' }]);
  });
});
