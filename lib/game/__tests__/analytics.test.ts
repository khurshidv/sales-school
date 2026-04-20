import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn().mockResolvedValue({ ok: true });
const mockSendBeacon = vi.fn().mockReturnValue(true);

vi.stubGlobal('fetch', mockFetch);
Object.defineProperty(globalThis.navigator, 'sendBeacon', {
  configurable: true,
  value: mockSendBeacon,
});

import {
  trackNodeEntered, trackNodeExited, trackBackNavigation,
  trackHeartbeat, trackDialogueReread, flushAnalyticsForTest,
} from '@/lib/game/analytics';

function lastFetchBody(): unknown {
  const [, init] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
  return JSON.parse((init as RequestInit).body as string);
}

describe('analytics helpers', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockSendBeacon.mockClear();
  });

  it('trackNodeEntered POSTs a node_entered event to /api/game/events', async () => {
    trackNodeEntered('00000000-0000-0000-0000-000000000001', 'car-dealership', 'day1', 'greeting_node');
    flushAnalyticsForTest();
    await Promise.resolve();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/game/events');
    expect((init as RequestInit).method).toBe('POST');
    expect(lastFetchBody()).toEqual({
      events: [{
        player_id: '00000000-0000-0000-0000-000000000001',
        event_type: 'node_entered',
        event_data: { node_id: 'greeting_node' },
        scenario_id: 'car-dealership',
        day_id: 'day1',
      }],
    });
  });

  it('trackNodeExited includes time_spent_ms', async () => {
    trackNodeExited('00000000-0000-0000-0000-000000000001', 'car-dealership', 'day1', 'greeting_node', 4200);
    flushAnalyticsForTest();
    await Promise.resolve();
    const body = lastFetchBody() as { events: Array<{ event_data: unknown }> };
    expect(body.events[0].event_data).toEqual({ node_id: 'greeting_node', time_spent_ms: 4200 });
  });

  it('trackBackNavigation includes from/to node ids', async () => {
    trackBackNavigation('00000000-0000-0000-0000-000000000001', 'car-dealership', 'day1', 'node_c', 'node_b');
    flushAnalyticsForTest();
    await Promise.resolve();
    const body = lastFetchBody() as { events: Array<{ event_type: string; event_data: unknown }> };
    expect(body.events[0].event_type).toBe('back_navigation');
    expect(body.events[0].event_data).toEqual({ from_node_id: 'node_c', to_node_id: 'node_b' });
  });

  it('trackHeartbeat records session_id and node_id', async () => {
    trackHeartbeat('00000000-0000-0000-0000-000000000001', 'car-dealership', 'day1', 'sess_1', 'node_x');
    flushAnalyticsForTest();
    await Promise.resolve();
    const body = lastFetchBody() as { events: Array<{ event_type: string; event_data: unknown }> };
    expect(body.events[0].event_type).toBe('heartbeat');
    expect(body.events[0].event_data).toEqual({ session_id: 'sess_1', node_id: 'node_x' });
  });

  it('trackDialogueReread logs reread count', async () => {
    trackDialogueReread('00000000-0000-0000-0000-000000000001', 'car-dealership', 'day1', 'dialogue_5', 2);
    flushAnalyticsForTest();
    await Promise.resolve();
    const body = lastFetchBody() as { events: Array<{ event_data: unknown }> };
    expect(body.events[0].event_data).toEqual({ node_id: 'dialogue_5', reread_count: 2 });
  });
});
