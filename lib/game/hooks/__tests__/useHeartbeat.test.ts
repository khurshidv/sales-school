import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHeartbeat } from '@/lib/game/hooks/useHeartbeat';

vi.mock('@/lib/game/analytics', () => ({
  trackHeartbeat: vi.fn(),
  trackIdleDetected: vi.fn(),
}));

import { trackHeartbeat, trackIdleDetected } from '@/lib/game/analytics';

describe('useHeartbeat', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits a heartbeat every 30 seconds while mounted', () => {
    renderHook(() =>
      useHeartbeat({
        enabled: true,
        playerId: 'p1',
        scenarioId: 'car-dealership',
        dayId: 'day1',
        sessionId: 'sess_1',
        currentNodeId: 'node_a',
      }),
    );

    expect(trackHeartbeat).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(30_000);
    expect(trackHeartbeat).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(trackHeartbeat).toHaveBeenCalledTimes(3);
  });

  it('does nothing when enabled=false', () => {
    renderHook(() =>
      useHeartbeat({
        enabled: false,
        playerId: 'p1',
        scenarioId: 's',
        dayId: 'd',
        sessionId: 'sid',
        currentNodeId: null,
      }),
    );
    vi.advanceTimersByTime(120_000);
    expect(trackHeartbeat).not.toHaveBeenCalled();
  });

  it('fires idle_detected after 60s of no activity', () => {
    renderHook(() =>
      useHeartbeat({
        enabled: true,
        playerId: 'p1',
        scenarioId: 's',
        dayId: 'd',
        sessionId: 'sid',
        currentNodeId: null,
      }),
    );
    vi.advanceTimersByTime(60_000);
    expect(trackIdleDetected).toHaveBeenCalledTimes(1);
  });

  it('resets idle on user activity', () => {
    renderHook(() =>
      useHeartbeat({
        enabled: true,
        playerId: 'p1',
        scenarioId: 's',
        dayId: 'd',
        sessionId: 'sid',
        currentNodeId: null,
      }),
    );
    vi.advanceTimersByTime(40_000);
    document.dispatchEvent(new Event('mousemove'));
    vi.advanceTimersByTime(40_000);
    // 40 + 40 = 80 total, but reset at 40 → only 40s of idle → no idle event
    expect(trackIdleDetected).not.toHaveBeenCalled();
    vi.advanceTimersByTime(30_000);
    expect(trackIdleDetected).toHaveBeenCalledTimes(1);
  });
});
