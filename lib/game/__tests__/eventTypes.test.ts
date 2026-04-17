import { describe, it, expect } from 'vitest';
import { GameEventType, ALL_GAME_EVENT_TYPES } from '@/lib/game/eventTypes';

describe('GameEventType', () => {
  it('includes all legacy types', () => {
    expect(GameEventType.GAME_STARTED).toBe('game_started');
    expect(GameEventType.DAY_STARTED).toBe('day_started');
    expect(GameEventType.DAY_COMPLETED).toBe('day_completed');
    expect(GameEventType.DAY_FAILED).toBe('day_failed');
    expect(GameEventType.CHOICE_MADE).toBe('choice_made');
    expect(GameEventType.ACHIEVEMENT_UNLOCKED).toBe('achievement_unlocked');
    expect(GameEventType.GAME_COMPLETED).toBe('game_completed');
    expect(GameEventType.DROPPED_OFF).toBe('dropped_off');
  });

  it('includes all Phase 1 new types', () => {
    expect(GameEventType.NODE_ENTERED).toBe('node_entered');
    expect(GameEventType.NODE_EXITED).toBe('node_exited');
    expect(GameEventType.BACK_NAVIGATION).toBe('back_navigation');
    expect(GameEventType.DIALOGUE_REREAD).toBe('dialogue_reread');
    expect(GameEventType.HEARTBEAT).toBe('heartbeat');
    expect(GameEventType.IDLE_DETECTED).toBe('idle_detected');
    expect(GameEventType.OFFER_VIEW).toBe('offer_view');
    expect(GameEventType.OFFER_CTA_CLICK).toBe('offer_cta_click');
    expect(GameEventType.OFFER_CONVERSION).toBe('offer_conversion');
  });

  it('ALL_GAME_EVENT_TYPES enumerates every value', () => {
    expect(ALL_GAME_EVENT_TYPES).toHaveLength(17);
    expect(new Set(ALL_GAME_EVENT_TYPES).size).toBe(17);
  });
});
