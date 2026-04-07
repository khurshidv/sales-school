import { describe, it, expect, vi } from 'vitest';
import { GameEventBus } from '../EventBus';
import type { GameEvent } from '../types';

describe('GameEventBus', () => {
  it('listener receives emitted event', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();

    bus.on('combo_reset', handler);
    bus.emit({ type: 'combo_reset' });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ type: 'combo_reset' });
  });

  it('multiple listeners on same type all called', () => {
    const bus = new GameEventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.on('life_lost', handler1);
    bus.on('life_lost', handler2);
    bus.emit({ type: 'life_lost', remainingLives: 2 });

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('off: removed listener not called', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();

    bus.on('combo_reset', handler);
    bus.off('combo_reset', handler);
    bus.emit({ type: 'combo_reset' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('typed events: score_changed event has correct shape', () => {
    const bus = new GameEventBus();
    const handler = vi.fn<(event: Extract<GameEvent, { type: 'score_changed' }>) => void>();

    bus.on('score_changed', handler);
    bus.emit({ type: 'score_changed', dimension: 'empathy', amount: 10, newTotal: 25 });

    expect(handler).toHaveBeenCalledWith({
      type: 'score_changed',
      dimension: 'empathy',
      amount: 10,
      newTotal: 25,
    });
  });

  it('clear: removes all listeners', () => {
    const bus = new GameEventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.on('combo_reset', handler1);
    bus.on('life_lost', handler2);
    bus.clear();

    bus.emit({ type: 'combo_reset' });
    bus.emit({ type: 'life_lost', remainingLives: 1 });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('emit without listeners does not throw', () => {
    const bus = new GameEventBus();

    expect(() => {
      bus.emit({ type: 'game_over', dayIndex: 0, totalScore: 0 });
    }).not.toThrow();
  });
});
