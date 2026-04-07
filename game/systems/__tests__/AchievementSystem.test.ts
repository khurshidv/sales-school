import { describe, it, expect } from 'vitest';
import {
  checkAchievements,
  isUnlocked,
  getAchievementDefinition,
  getAllAchievements,
} from '@/game/systems/AchievementSystem';
import type {
  GameSessionState,
  PlayerState,
  Rating,
  CompletedScenarioRecord,
} from '@/game/engine/types';
import { createInitialGameSession } from '@/game/engine/types';

// ============================================================
// Helpers
// ============================================================

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: 'p1',
    phone: '+998901234567',
    displayName: 'Test',
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

function makeSession(overrides: Partial<GameSessionState> = {}): GameSessionState {
  const base = createInitialGameSession('car-dealership', 0, 'intro');
  return { ...base, ...overrides };
}

function makeCompleted(
  dayIndex: number,
  rating: Rating,
  isReplay = false,
): CompletedScenarioRecord {
  return {
    scenarioId: 'car-dealership',
    dayIndex,
    score: 100,
    rating,
    timeTaken: 60000,
    isReplay,
    completedAt: Date.now(),
  };
}

// ============================================================
// 1. Progress achievements — 5 tests
// ============================================================
describe('Progress achievements', () => {
  it('first_contact: unlocks on Day 1 success', () => {
    const state = makeSession({ dayIndex: 0 });
    const player = makePlayer();
    const ids = checkAchievements(state, player, {
      dayOutcome: 'success',
      dayRating: 'B',
      dayIndex: 0,
    });
    expect(ids).toContain('first_contact');
  });

  it('final_test_passed: unlocks on Day 5 success', () => {
    const state = makeSession({ dayIndex: 4 });
    const player = makePlayer();
    const ids = checkAchievements(state, player, {
      dayOutcome: 'success',
      dayRating: 'B',
      dayIndex: 4,
    });
    expect(ids).toContain('final_test_passed');
  });

  it('full_week: unlocks when player has 5 completed days', () => {
    const state = makeSession({ dayIndex: 4 });
    const player = makePlayer({
      completedScenarios: [
        makeCompleted(0, 'A'),
        makeCompleted(1, 'A'),
        makeCompleted(2, 'A'),
        makeCompleted(3, 'A'),
        makeCompleted(4, 'A'),
      ],
    });
    const ids = checkAchievements(state, player, {});
    expect(ids).toContain('full_week');
  });

  it('car_master: unlocks when all 5 days have A+ (A or S) rating', () => {
    const state = makeSession();
    const player = makePlayer({
      completedScenarios: [
        makeCompleted(0, 'A'),
        makeCompleted(1, 'S'),
        makeCompleted(2, 'A'),
        makeCompleted(3, 'S'),
        makeCompleted(4, 'A'),
      ],
    });
    const ids = checkAchievements(state, player, {});
    expect(ids).toContain('car_master');
  });

  it('perfectionist: unlocks when all 5 days have S rating in one run (no replays)', () => {
    const state = makeSession();
    const player = makePlayer({
      completedScenarios: [
        makeCompleted(0, 'S', false),
        makeCompleted(1, 'S', false),
        makeCompleted(2, 'S', false),
        makeCompleted(3, 'S', false),
        makeCompleted(4, 'S', false),
      ],
    });
    const ids = checkAchievements(state, player, {});
    expect(ids).toContain('perfectionist');
  });
});

// ============================================================
// 2. Skill achievements — 5 tests
// ============================================================
describe('Skill achievements', () => {
  it('combo_king: unlocks when combo count >= 5', () => {
    const state = makeSession({ comboCount: 5 });
    const player = makePlayer();
    const ids = checkAchievements(state, player, {});
    expect(ids).toContain('combo_king');
  });

  it('speed_demon: unlocks with 3+ speed bonuses (flags)', () => {
    const state = makeSession({
      flags: {
        speed_bonus_1: true,
        speed_bonus_2: true,
        speed_bonus_3: true,
      },
    });
    const player = makePlayer();
    const ids = checkAchievements(state, player, {});
    expect(ids).toContain('speed_demon');
  });

  it('all_rounder: unlocks when each dimension >= 80% of max dimension', () => {
    const state = makeSession({
      score: {
        total: 700,
        dimensions: {
          empathy: 90,
          rapport: 85,
          timing: 80,
          expertise: 88,
          persuasion: 82,
          discovery: 84,
          opportunity: 81,
        },
      },
    });
    const player = makePlayer();
    const ids = checkAchievements(state, player, {});
    expect(ids).toContain('all_rounder');
  });

  it('comeback_kid: unlocks when previous rating was F, is replay, and current rating is A+', () => {
    const state = makeSession({ isReplay: true });
    const player = makePlayer();
    const ids = checkAchievements(state, player, {
      dayRating: 'A',
      isReplay: true,
      previousRating: 'F',
    });
    expect(ids).toContain('comeback_kid');
  });

  it('no_pressure: unlocks when all timed choices answered in first 50% of time', () => {
    const state = makeSession({
      flags: { all_timed_in_first_half: true },
    });
    const player = makePlayer();
    const ids = checkAchievements(state, player, {});
    expect(ids).toContain('no_pressure');
  });
});

// ============================================================
// 3. Hidden achievements — 5 tests
// ============================================================
describe('Hidden achievements', () => {
  it('respect_earns_referrals: unlocks on Day 2 hidden ending', () => {
    const state = makeSession({ dayIndex: 1 });
    const player = makePlayer();
    const ids = checkAchievements(state, player, {
      dayOutcome: 'hidden_ending',
      dayIndex: 1,
    });
    expect(ids).toContain('respect_earns_referrals');
  });

  it('love_sells: unlocks on Day 3 hidden ending', () => {
    const state = makeSession({ dayIndex: 2 });
    const player = makePlayer();
    const ids = checkAchievements(state, player, {
      dayOutcome: 'hidden_ending',
      dayIndex: 2,
    });
    expect(ids).toContain('love_sells');
  });

  it('corporate_king: unlocks on Day 4 hidden ending', () => {
    const state = makeSession({ dayIndex: 3 });
    const player = makePlayer();
    const ids = checkAchievements(state, player, {
      dayOutcome: 'hidden_ending',
      dayIndex: 3,
    });
    expect(ids).toContain('corporate_king');
  });

  it('grandmaster: unlocks on Day 5 hidden ending', () => {
    const state = makeSession({ dayIndex: 4 });
    const player = makePlayer();
    const ids = checkAchievements(state, player, {
      dayOutcome: 'hidden_ending',
      dayIndex: 4,
    });
    expect(ids).toContain('grandmaster');
  });

  it('secret_hunter: unlocks when all 4 hidden achievements are already unlocked', () => {
    const state = makeSession();
    const player = makePlayer({
      achievements: [
        'respect_earns_referrals',
        'love_sells',
        'corporate_king',
        'grandmaster',
      ],
    });
    const ids = checkAchievements(state, player, {});
    expect(ids).toContain('secret_hunter');
  });
});

// ============================================================
// 4. Dedup + utility — 3 tests
// ============================================================
describe('Dedup and utility', () => {
  it('does not return already-unlocked achievements', () => {
    const state = makeSession({ dayIndex: 0 });
    const player = makePlayer({ achievements: ['first_contact'] });
    const ids = checkAchievements(state, player, {
      dayOutcome: 'success',
      dayRating: 'B',
      dayIndex: 0,
    });
    expect(ids).not.toContain('first_contact');
  });

  it('isUnlocked returns true for unlocked achievement', () => {
    const player = makePlayer({ achievements: ['combo_king'] });
    expect(isUnlocked('combo_king', player)).toBe(true);
  });

  it('getAllAchievements returns exactly 15 definitions', () => {
    expect(getAllAchievements()).toHaveLength(15);
  });
});
