import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: () => ({ insert: mockInsert }) }),
}));

import { trackNodeEntered, trackNodeExited, trackBackNavigation, trackHeartbeat, trackDialogueReread, flushAnalyticsForTest } from '@/lib/game/analytics';

describe('analytics helpers', () => {
  beforeEach(() => {
    mockInsert.mockClear();
  });

  it('trackNodeEntered queues a node_entered event with node_id', async () => {
    trackNodeEntered('p1', 'car-dealership', 'day1', 'greeting_node');
    flushAnalyticsForTest();
    await Promise.resolve();
    expect(mockInsert).toHaveBeenCalledTimes(1);
    const batch = mockInsert.mock.calls[0][0];
    expect(batch[0]).toMatchObject({
      player_id: 'p1',
      event_type: 'node_entered',
      scenario_id: 'car-dealership',
      day_id: 'day1',
      event_data: { node_id: 'greeting_node' },
    });
  });

  it('trackNodeExited includes time_spent_ms', async () => {
    trackNodeExited('p1', 'car-dealership', 'day1', 'greeting_node', 4200);
    flushAnalyticsForTest();
    await Promise.resolve();
    const batch = mockInsert.mock.calls[0][0];
    expect(batch[0].event_data).toEqual({ node_id: 'greeting_node', time_spent_ms: 4200 });
  });

  it('trackBackNavigation includes from/to node ids', async () => {
    trackBackNavigation('p1', 'car-dealership', 'day1', 'node_c', 'node_b');
    flushAnalyticsForTest();
    await Promise.resolve();
    expect(mockInsert.mock.calls[0][0][0]).toMatchObject({
      event_type: 'back_navigation',
      event_data: { from_node_id: 'node_c', to_node_id: 'node_b' },
    });
  });

  it('trackHeartbeat records session_id and node_id', async () => {
    trackHeartbeat('p1', 'car-dealership', 'day1', 'sess_1', 'node_x');
    flushAnalyticsForTest();
    await Promise.resolve();
    expect(mockInsert.mock.calls[0][0][0]).toMatchObject({
      event_type: 'heartbeat',
      event_data: { session_id: 'sess_1', node_id: 'node_x' },
    });
  });

  it('trackDialogueReread logs reread count', async () => {
    trackDialogueReread('p1', 'car-dealership', 'day1', 'dialogue_5', 2);
    flushAnalyticsForTest();
    await Promise.resolve();
    expect(mockInsert.mock.calls[0][0][0]).toMatchObject({
      event_type: 'dialogue_reread',
      event_data: { node_id: 'dialogue_5', reread_count: 2 },
    });
  });
});
