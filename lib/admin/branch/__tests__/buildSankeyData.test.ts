import { describe, it, expect } from 'vitest';
import { buildSankeyData } from '@/lib/admin/branch/buildSankeyData';

const sortLinks = (links: Array<{ source: string; target: string; value: number }>) =>
  [...links].sort((a, b) => `${a.source}${a.target}`.localeCompare(`${b.source}${b.target}`));

describe('buildSankeyData', () => {
  it('returns empty data for empty input', () => {
    expect(buildSankeyData([])).toEqual({ nodes: [], links: [] });
  });

  it('produces unique nodes and one link per row (order-independent)', () => {
    const data = buildSankeyData([
      { from_node: 'a', to_node: 'b', flow_count: 5 },
      { from_node: 'a', to_node: 'c', flow_count: 3 },
      { from_node: 'b', to_node: 'd', flow_count: 5 },
    ]);
    expect(data.nodes.map((n) => n.id).sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(sortLinks(data.links)).toEqual(sortLinks([
      { source: 'a', target: 'b', value: 5 },
      { source: 'a', target: 'c', value: 3 },
      { source: 'b', target: 'd', value: 5 },
    ]));
  });

  it('drops self-loops to prevent Sankey crashes', () => {
    const data = buildSankeyData([
      { from_node: 'a', to_node: 'a', flow_count: 1 },
      { from_node: 'a', to_node: 'b', flow_count: 2 },
    ]);
    expect(data.links).toEqual([{ source: 'a', target: 'b', value: 2 }]);
    expect(data.nodes.map((n) => n.id).sort()).toEqual(['a', 'b']);
  });

  it('removes cyclic back-navigation edges, keeps high-traffic forward edges', () => {
    // Player went A→B→C (forward), then B←C (back), creating cycle B→C→B
    const data = buildSankeyData([
      { from_node: 'a', to_node: 'b', flow_count: 10 },
      { from_node: 'b', to_node: 'c', flow_count: 8 },
      { from_node: 'c', to_node: 'b', flow_count: 3 }, // back-navigation, low traffic → dropped
    ]);
    const sourceTargets = data.links.map((l) => `${l.source}→${l.target}`).sort();
    expect(sourceTargets).toEqual(['a→b', 'b→c']); // c→b dropped
    expect(data.nodes.map((n) => n.id).sort()).toEqual(['a', 'b', 'c']);
  });

  it('keeps high-traffic edge over low-traffic edge when cycle exists', () => {
    // If cycle, the higher-value edge should be kept
    const data = buildSankeyData([
      { from_node: 'a', to_node: 'b', flow_count: 10 },
      { from_node: 'b', to_node: 'a', flow_count: 2 }, // low-traffic cycle edge → dropped
    ]);
    expect(data.links).toEqual([{ source: 'a', target: 'b', value: 10 }]);
  });
});
