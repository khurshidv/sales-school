import { describe, it, expect } from 'vitest';
import {
  loseLife,
  gainLife,
  isGameOver,
  shouldLoseLife,
  shouldGainLife,
  handleGameOver,
} from '@/game/systems/LivesSystem';
import type { GameSessionState, Day, Rating, DayOutcome } from '@/game/engine/types';
import { createInitialGameSession } from '@/game/engine/types';

function makeState(overrides: Partial<GameSessionState> = {}): GameSessionState {
  const base = createInitialGameSession('test-scenario', 0, 'intro');
  return { ...base, ...overrides };
}

function makeDay(overrides: Partial<Day> = {}): Day {
  return {
    id: 'day-1',
    dayNumber: 1,
    title: { uz: 'Kun 1', ru: 'День 1' },
    rootNodeId: 'root',
    nodes: {},
    targetScore: 50,
    ...overrides,
  };
}

describe('LivesSystem', () => {
  // --- loseLife ---
  describe('loseLife', () => {
    it('decrements 3 to 2', () => {
      expect(loseLife(3)).toBe(2);
    });

    it('decrements 1 to 0', () => {
      expect(loseLife(1)).toBe(0);
    });

    it('does not go below 0', () => {
      expect(loseLife(0)).toBe(0);
    });
  });

  // --- gainLife ---
  describe('gainLife', () => {
    it('increments 3 to 4', () => {
      expect(gainLife(3, 5)).toBe(4);
    });

    it('does not exceed maxLives', () => {
      expect(gainLife(5, 5)).toBe(5);
    });
  });

  // --- isGameOver ---
  describe('isGameOver', () => {
    it('returns true when lives is 0', () => {
      expect(isGameOver(0)).toBe(true);
    });

    it('returns false when lives is 1', () => {
      expect(isGameOver(1)).toBe(false);
    });
  });

  // --- shouldLoseLife ---
  describe('shouldLoseLife', () => {
    it('returns true for F rating', () => {
      expect(shouldLoseLife('F')).toBe(true);
    });

    it('returns false for D rating', () => {
      expect(shouldLoseLife('D')).toBe(false);
    });

    it('returns false for S rating', () => {
      expect(shouldLoseLife('S')).toBe(false);
    });
  });

  // --- shouldGainLife ---
  describe('shouldGainLife', () => {
    it('returns true for hidden_ending', () => {
      expect(shouldGainLife('hidden_ending')).toBe(true);
    });

    it('returns false for success', () => {
      expect(shouldGainLife('success')).toBe(false);
    });
  });

  // --- handleGameOver ---
  describe('handleGameOver', () => {
    it('preserves cross-day flags (keys like d1_xxx)', () => {
      const state = makeState({
        currentNodeId: 'some-node',
        score: { total: 500, dimensions: { empathy: 100, rapport: 100, timing: 100, expertise: 100, persuasion: 50, discovery: 25, opportunity: 25 } },
        flags: { d1_met_boss: true, d2_sold_car: true, local_flag: true, greeted: true },
        comboCount: 5,
        lives: 0,
      });
      const day = makeDay({ rootNodeId: 'root' });

      const result = handleGameOver(state, day);

      expect(result.flags).toEqual({ d1_met_boss: true, d2_sold_car: true });
      expect(result.flags).not.toHaveProperty('local_flag');
      expect(result.flags).not.toHaveProperty('greeted');
    });

    it('resets score, combo, lives and sets restart flags', () => {
      const state = makeState({
        currentNodeId: 'some-node',
        score: { total: 500, dimensions: { empathy: 100, rapport: 100, timing: 100, expertise: 100, persuasion: 50, discovery: 25, opportunity: 25 } },
        flags: { d1_met_boss: true, local_flag: true },
        comboCount: 5,
        lives: 0,
      });
      const day = makeDay({ rootNodeId: 'root' });

      const result = handleGameOver(state, day);

      expect(result.currentNodeId).toBe('root');
      expect(result.score.total).toBe(0);
      expect(result.comboCount).toBe(0);
      expect(result.lives).toBe(1);
      expect(result.isReplay).toBe(true);
      expect(result.isGameOverRestart).toBe(true);
    });
  });
});
