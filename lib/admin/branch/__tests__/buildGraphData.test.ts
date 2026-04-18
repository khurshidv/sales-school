import { describe, it, expect } from 'vitest';
import { buildGraphData } from '@/lib/admin/branch/buildGraphData';
import type { BranchFlowRow, NodeStat, DropoffRow } from '@/lib/admin/types-v2';

describe('buildGraphData', () => {
  it('produces a node per stat and a link per flow', () => {
    const flows: BranchFlowRow[] = [
      { from_node: 'a', to_node: 'b', flow_count: 5 },
    ];
    const stats: NodeStat[] = [
      { node_id: 'a', entered_count: 10, avg_thinking_time_ms: 4000, exit_count: 8 },
      { node_id: 'b', entered_count: 5, avg_thinking_time_ms: 6000, exit_count: 5 },
    ];
    const dropoffs: DropoffRow[] = [];
    const g = buildGraphData(flows, stats, dropoffs);
    expect(g.nodes).toEqual([
      { id: 'a', size: 10, group: 'success' },
      { id: 'b', size: 5, group: 'success' },
    ]);
    expect(g.links).toEqual([{ source: 'a', target: 'b', value: 5 }]);
  });

  it('marks nodes appearing in dropoffs as "fail"', () => {
    const g = buildGraphData(
      [],
      [{ node_id: 'a', entered_count: 10, avg_thinking_time_ms: 0, exit_count: 0 }],
      [{ node_id: 'a', day_id: 'd1', dropoff_count: 6 }],
    );
    expect(g.nodes).toEqual([{ id: 'a', size: 10, group: 'fail' }]);
  });

  it('marks nodes with high thinking time as "warn"', () => {
    const g = buildGraphData(
      [],
      [{ node_id: 'a', entered_count: 10, avg_thinking_time_ms: 20_000, exit_count: 9 }],
      [],
    );
    expect(g.nodes[0].group).toBe('warn');
  });
});
