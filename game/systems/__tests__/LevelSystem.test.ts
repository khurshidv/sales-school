import { describe, it, expect } from 'vitest';
import {
  xpForLevel,
  calculateLevel,
  addXp,
  xpToNextLevel,
  getProgress,
} from '@/game/systems/LevelSystem';
import type { PlayerState } from '@/game/engine/types';

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: 'player-1',
    phone: '+998901234567',
    displayName: 'Test Player',
    avatarId: 'male',
    level: 1,
    totalXp: 0,
    totalScore: 0,
    coins: 0,
    achievements: [],
    completedScenarios: [],
    ...overrides,
  };
}

describe('LevelSystem', () => {
  // --- xpForLevel ---
  describe('xpForLevel', () => {
    it('level 1 requires 100 XP', () => {
      expect(xpForLevel(1)).toBe(100);
    });

    it('level 2 requires 282 XP', () => {
      expect(xpForLevel(2)).toBe(282);
    });

    it('level 10 requires 3162 XP', () => {
      expect(xpForLevel(10)).toBe(3162);
    });
  });

  // --- calculateLevel ---
  describe('calculateLevel', () => {
    it('0 XP is level 1', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('99 XP is still level 1', () => {
      expect(calculateLevel(99)).toBe(1);
    });

    it('100 XP is level 2', () => {
      expect(calculateLevel(100)).toBe(2);
    });

    it('382 XP (100+282) is level 3', () => {
      expect(calculateLevel(382)).toBe(3);
    });
  });

  // --- addXp ---
  describe('addXp', () => {
    it('adding 100 XP from 0 reaches level 2', () => {
      const player = makePlayer({ totalXp: 0, level: 1 });
      const result = addXp(player, 100);
      expect(result.totalXp).toBe(100);
      expect(result.level).toBe(2);
    });

    it('adding 500 XP from 0 reaches correct level', () => {
      const player = makePlayer({ totalXp: 0, level: 1 });
      const result = addXp(player, 500);
      expect(result.totalXp).toBe(500);
      // 100 (lvl1) + 282 (lvl2) = 382 for lvl3, 500 - 382 = 118, lvl3 needs 519
      expect(result.level).toBe(3);
    });
  });

  // --- xpToNextLevel ---
  describe('xpToNextLevel', () => {
    it('level 1 with 0 XP needs 100 to next level', () => {
      expect(xpToNextLevel(1, 0)).toBe(100);
    });

    it('level 1 with 50 XP needs 50 to next level', () => {
      expect(xpToNextLevel(1, 50)).toBe(50);
    });
  });

  // --- getProgress ---
  describe('getProgress', () => {
    it('level 1 with 50 XP is 0.5 progress', () => {
      expect(getProgress(1, 50)).toBeCloseTo(0.5);
    });

    it('level 1 with 0 XP is 0.0 progress', () => {
      expect(getProgress(1, 0)).toBeCloseTo(0.0);
    });
  });
});
