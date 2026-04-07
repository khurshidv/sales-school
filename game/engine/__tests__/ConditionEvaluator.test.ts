import { describe, it, expect } from 'vitest';
import type { Condition, GameSessionState, PlayerState } from '../types';
import { createInitialGameSession } from '../types';
import { evaluateCondition } from '../ConditionEvaluator';

// --- Helpers ---

function makeState(overrides: Partial<GameSessionState> = {}): GameSessionState {
  return { ...createInitialGameSession('test', 0, 'root'), ...overrides };
}

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: '1',
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

// ============================================================
// Basic conditions (16 tests)
// ============================================================

describe('ConditionEvaluator — basic conditions', () => {
  // score_gte
  it('score_gte: true when score >= value', () => {
    const state = makeState({ score: { total: 50, dimensions: { empathy: 0, rapport: 0, timing: 0, expertise: 0, persuasion: 0, discovery: 0, opportunity: 0 } } });
    const cond: Condition = { type: 'score_gte', value: 50 };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it('score_gte: false when score < value', () => {
    const state = makeState({ score: { total: 49, dimensions: { empathy: 0, rapport: 0, timing: 0, expertise: 0, persuasion: 0, discovery: 0, opportunity: 0 } } });
    const cond: Condition = { type: 'score_gte', value: 50 };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  // score_lte
  it('score_lte: true when score <= value', () => {
    const state = makeState({ score: { total: 30, dimensions: { empathy: 0, rapport: 0, timing: 0, expertise: 0, persuasion: 0, discovery: 0, opportunity: 0 } } });
    const cond: Condition = { type: 'score_lte', value: 30 };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it('score_lte: false when score > value', () => {
    const state = makeState({ score: { total: 31, dimensions: { empathy: 0, rapport: 0, timing: 0, expertise: 0, persuasion: 0, discovery: 0, opportunity: 0 } } });
    const cond: Condition = { type: 'score_lte', value: 30 };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  // flag
  it('flag: true when flag exists and is true', () => {
    const state = makeState({ flags: { patient_approach: true } });
    const cond: Condition = { type: 'flag', flag: 'patient_approach' };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it('flag: false when flag exists and is false', () => {
    const state = makeState({ flags: { patient_approach: false } });
    const cond: Condition = { type: 'flag', flag: 'patient_approach' };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  it('flag: false when flag is missing', () => {
    const state = makeState({ flags: {} });
    const cond: Condition = { type: 'flag', flag: 'patient_approach' };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  // has_achievement
  it('has_achievement: true when achievement is in player list', () => {
    const state = makeState();
    const player = makePlayer({ achievements: ['first_contact', 'speed_demon'] });
    const cond: Condition = { type: 'has_achievement', achievementId: 'first_contact' };
    expect(evaluateCondition(cond, state, player)).toBe(true);
  });

  it('has_achievement: false when achievement is not in player list', () => {
    const state = makeState();
    const player = makePlayer({ achievements: ['speed_demon'] });
    const cond: Condition = { type: 'has_achievement', achievementId: 'first_contact' };
    expect(evaluateCondition(cond, state, player)).toBe(false);
  });

  // choice_was
  it('choice_was: true when matching nodeId and choiceIndex', () => {
    const state = makeState({
      choiceHistory: [
        { nodeId: 'approach_choice', choiceIndex: 1, timestamp: 1000 },
      ],
    });
    const cond: Condition = { type: 'choice_was', nodeId: 'approach_choice', choiceIndex: 1 };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it('choice_was: false when choiceIndex does not match', () => {
    const state = makeState({
      choiceHistory: [
        { nodeId: 'approach_choice', choiceIndex: 2, timestamp: 1000 },
      ],
    });
    const cond: Condition = { type: 'choice_was', nodeId: 'approach_choice', choiceIndex: 1 };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  it('choice_was: false when nodeId not in history', () => {
    const state = makeState({ choiceHistory: [] });
    const cond: Condition = { type: 'choice_was', nodeId: 'approach_choice', choiceIndex: 0 };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  // lives_gte
  it('lives_gte: true when lives >= value', () => {
    const state = makeState({ lives: 3 });
    const cond: Condition = { type: 'lives_gte', value: 3 };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it('lives_gte: false when lives < value', () => {
    const state = makeState({ lives: 1 });
    const cond: Condition = { type: 'lives_gte', value: 2 };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  // level_gte
  it('level_gte: true when player level >= value', () => {
    const state = makeState();
    const player = makePlayer({ level: 5 });
    const cond: Condition = { type: 'level_gte', value: 5 };
    expect(evaluateCondition(cond, state, player)).toBe(true);
  });

  it('level_gte: false when player level < value', () => {
    const state = makeState();
    const player = makePlayer({ level: 2 });
    const cond: Condition = { type: 'level_gte', value: 3 };
    expect(evaluateCondition(cond, state, player)).toBe(false);
  });
});

// ============================================================
// Combinators (7 tests)
// ============================================================

describe('ConditionEvaluator — combinators', () => {
  // and
  it('and: true when all conditions are true', () => {
    const state = makeState({
      score: { total: 80, dimensions: { empathy: 0, rapport: 0, timing: 0, expertise: 0, persuasion: 0, discovery: 0, opportunity: 0 } },
      flags: { patient_approach: true },
    });
    const cond: Condition = {
      type: 'and',
      conditions: [
        { type: 'score_gte', value: 50 },
        { type: 'flag', flag: 'patient_approach' },
      ],
    };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it('and: false when one condition is false', () => {
    const state = makeState({
      score: { total: 40, dimensions: { empathy: 0, rapport: 0, timing: 0, expertise: 0, persuasion: 0, discovery: 0, opportunity: 0 } },
      flags: { patient_approach: true },
    });
    const cond: Condition = {
      type: 'and',
      conditions: [
        { type: 'score_gte', value: 50 },
        { type: 'flag', flag: 'patient_approach' },
      ],
    };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  it('and: true when conditions array is empty', () => {
    const state = makeState();
    const cond: Condition = { type: 'and', conditions: [] };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  // or
  it('or: true when at least one condition is true', () => {
    const state = makeState({ flags: { d1_success: false, d2_success: true } });
    const cond: Condition = {
      type: 'or',
      conditions: [
        { type: 'flag', flag: 'd1_success' },
        { type: 'flag', flag: 'd2_success' },
      ],
    };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it('or: false when all conditions are false', () => {
    const state = makeState({ flags: { d1_success: false, d2_success: false } });
    const cond: Condition = {
      type: 'or',
      conditions: [
        { type: 'flag', flag: 'd1_success' },
        { type: 'flag', flag: 'd2_success' },
      ],
    };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  it('or: false when conditions array is empty', () => {
    const state = makeState();
    const cond: Condition = { type: 'or', conditions: [] };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  // not
  it('not: inverts true to false', () => {
    const state = makeState({ flags: { patient_approach: true } });
    const cond: Condition = { type: 'not', condition: { type: 'flag', flag: 'patient_approach' } };
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  it('not: inverts false to true', () => {
    const state = makeState({ flags: {} });
    const cond: Condition = { type: 'not', condition: { type: 'flag', flag: 'patient_approach' } };
    expect(evaluateCondition(cond, state)).toBe(true);
  });
});

// ============================================================
// Nesting (4 tests)
// ============================================================

describe('ConditionEvaluator — nesting', () => {
  it('and containing or', () => {
    const state = makeState({
      score: { total: 70, dimensions: { empathy: 0, rapport: 0, timing: 0, expertise: 0, persuasion: 0, discovery: 0, opportunity: 0 } },
      flags: { d1_success: false, d2_success: true },
    });
    const cond: Condition = {
      type: 'and',
      conditions: [
        { type: 'score_gte', value: 63 },
        {
          type: 'or',
          conditions: [
            { type: 'flag', flag: 'd1_success' },
            { type: 'flag', flag: 'd2_success' },
          ],
        },
      ],
    };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it('not containing and', () => {
    const state = makeState({
      score: { total: 70, dimensions: { empathy: 0, rapport: 0, timing: 0, expertise: 0, persuasion: 0, discovery: 0, opportunity: 0 } },
      flags: { patient_approach: true },
    });
    const cond: Condition = {
      type: 'not',
      condition: {
        type: 'and',
        conditions: [
          { type: 'score_gte', value: 63 },
          { type: 'flag', flag: 'patient_approach' },
        ],
      },
    };
    // Both inner conditions true → and is true → not inverts to false
    expect(evaluateCondition(cond, state)).toBe(false);
  });

  it('3-level deep nesting: not(or(and(...), flag(...)))', () => {
    const state = makeState({
      score: { total: 10, dimensions: { empathy: 0, rapport: 0, timing: 0, expertise: 0, persuasion: 0, discovery: 0, opportunity: 0 } },
      flags: { some_flag: false },
    });
    const cond: Condition = {
      type: 'not',
      condition: {
        type: 'or',
        conditions: [
          {
            type: 'and',
            conditions: [
              { type: 'score_gte', value: 50 },
              { type: 'flag', flag: 'some_flag' },
            ],
          },
          { type: 'flag', flag: 'other_flag' },
        ],
      },
    };
    // and(score<50, flag false) = false; or(false, flag missing=false) = false; not(false) = true
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it('Day 5 grandmaster condition', () => {
    const state = makeState({
      score: { total: 70, dimensions: { empathy: 0, rapport: 0, timing: 0, expertise: 0, persuasion: 0, discovery: 0, opportunity: 0 } },
      flags: {
        patient_approach: true,
        deep_discovery: true,
        honest_answer: true,
        d1_success: false,
        d2_success: true,
      },
    });
    const cond: Condition = {
      type: 'and',
      conditions: [
        { type: 'score_gte', value: 63 },
        { type: 'flag', flag: 'patient_approach' },
        { type: 'flag', flag: 'deep_discovery' },
        { type: 'flag', flag: 'honest_answer' },
        {
          type: 'or',
          conditions: [
            { type: 'flag', flag: 'd1_success' },
            { type: 'flag', flag: 'd2_success' },
          ],
        },
      ],
    };
    expect(evaluateCondition(cond, state)).toBe(true);
  });
});

// ============================================================
// Edge cases (4 tests)
// ============================================================

describe('ConditionEvaluator — edge cases', () => {
  it('choice_was with choiceIndex 0', () => {
    const state = makeState({
      choiceHistory: [
        { nodeId: 'first_choice', choiceIndex: 0, timestamp: 1000 },
      ],
    });
    const cond: Condition = { type: 'choice_was', nodeId: 'first_choice', choiceIndex: 0 };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it('score_gte with value 0 is always true', () => {
    const state = makeState(); // total score starts at 0
    const cond: Condition = { type: 'score_gte', value: 0 };
    expect(evaluateCondition(cond, state)).toBe(true);
  });

  it('pure function: same input produces same output twice', () => {
    const state = makeState({
      score: { total: 42, dimensions: { empathy: 0, rapport: 0, timing: 0, expertise: 0, persuasion: 0, discovery: 0, opportunity: 0 } },
      flags: { patient_approach: true },
    });
    const cond: Condition = {
      type: 'and',
      conditions: [
        { type: 'score_gte', value: 40 },
        { type: 'flag', flag: 'patient_approach' },
      ],
    };
    const result1 = evaluateCondition(cond, state);
    const result2 = evaluateCondition(cond, state);
    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result1).toBe(result2);
  });

  it('unknown condition type does not crash, returns false', () => {
    const state = makeState();
    // Force an unknown condition type via type assertion
    const cond = { type: 'unknown_type', value: 42 } as unknown as Condition;
    expect(evaluateCondition(cond, state)).toBe(false);
  });
});
