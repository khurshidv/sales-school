import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRpc = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ rpc: mockRpc }),
}));

import {
  getBranchFlow,
  getNodeStats,
  getDropoffZones,
  getEngagementIndexRaw,
  periodToRange,
} from '@/lib/admin/queries-v2';

describe('queries-v2', () => {
  beforeEach(() => { mockRpc.mockReset(); });

  it('getBranchFlow forwards args and returns rows', async () => {
    mockRpc.mockResolvedValue({ data: [{ from_node: 'a', to_node: 'b', flow_count: 5 }], error: null });
    const rows = await getBranchFlow({ scenarioId: 's', dayId: 'd1', from: null, to: null });
    expect(mockRpc).toHaveBeenCalledWith('get_branch_flow', {
      p_scenario_id: 's', p_day_id: 'd1', p_from: null, p_to: null,
    });
    expect(rows).toEqual([{ from_node: 'a', to_node: 'b', flow_count: 5 }]);
  });

  it('getNodeStats coerces avg_thinking_time_ms numeric to number', async () => {
    mockRpc.mockResolvedValue({
      data: [{ node_id: 'n', entered_count: '3', avg_thinking_time_ms: '4200.5', exit_count: '2' }],
      error: null,
    });
    const rows = await getNodeStats({ scenarioId: 's', dayId: 'd1', from: null, to: null });
    expect(rows[0].entered_count).toBe(3);
    expect(rows[0].avg_thinking_time_ms).toBeCloseTo(4200.5);
    expect(rows[0].exit_count).toBe(2);
  });

  it('getDropoffZones returns empty array when data is null', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    const rows = await getDropoffZones({ scenarioId: 's', from: null, to: null });
    expect(rows).toEqual([]);
  });

  it('getEngagementIndexRaw normalizes nullable numerics', async () => {
    mockRpc.mockResolvedValue({
      data: { completion_rate: 0.75, avg_thinking_time_ms: null, replay_rate: 0.2 },
      error: null,
    });
    const blob = await getEngagementIndexRaw({ scenarioId: 's', from: null, to: null });
    expect(blob).toEqual({ completion_rate: 0.75, avg_thinking_time_ms: null, replay_rate: 0.2 });
  });

  it('periodToRange("7d") returns from = now - 7d, to = null', () => {
    const now = new Date('2026-04-17T12:00:00Z');
    const r = periodToRange('7d', now);
    expect(r.from).toBe('2026-04-10T12:00:00.000Z');
    expect(r.to).toBeNull();
  });

  it('periodToRange("all") returns nulls', () => {
    expect(periodToRange('all', new Date())).toEqual({ from: null, to: null });
  });
});
