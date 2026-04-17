import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChoiceTimer } from '@/lib/game/hooks/useChoiceTimer';

describe('useChoiceTimer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns 0ms when read immediately', () => {
    const { result } = renderHook(() => useChoiceTimer('node_a'));
    expect(result.current.elapsedMs()).toBe(0);
  });

  it('returns elapsed ms since mount', () => {
    const { result } = renderHook(() => useChoiceTimer('node_a'));
    act(() => { vi.advanceTimersByTime(4200); });
    expect(result.current.elapsedMs()).toBe(4200);
  });

  it('resets when nodeId changes', () => {
    const { result, rerender } = renderHook(
      ({ id }) => useChoiceTimer(id),
      { initialProps: { id: 'node_a' } },
    );
    act(() => { vi.advanceTimersByTime(3000); });
    rerender({ id: 'node_b' });
    expect(result.current.elapsedMs()).toBe(0);
    act(() => { vi.advanceTimersByTime(1500); });
    expect(result.current.elapsedMs()).toBe(1500);
  });
});
