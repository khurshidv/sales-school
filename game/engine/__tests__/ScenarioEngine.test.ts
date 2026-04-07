import { describe, it, expect } from 'vitest';
import type {
  Day,
  GameSessionState,
  PlayerState,
  ChoiceNode,
  Effect,
} from '../types';
import { createInitialGameSession, createEmptyDimensionScores } from '../types';
import {
  resolveNode,
  applyEffects,
  processNode,
  makeChoice,
  makeMultiChoice,
  getAvailableChoices,
  initDaySession,
} from '../ScenarioEngine';

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

// --- Test scenario ---

const testDay: Day = {
  id: 'test-day',
  dayNumber: 1,
  title: { uz: 'Test', ru: 'Тест' },
  rootNodeId: 'start',
  targetScore: 30,
  nodes: {
    start: {
      id: 'start',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      text: { uz: '', ru: '' },
      nextNodeId: 'choice1',
    },
    choice1: {
      id: 'choice1',
      type: 'choice',
      prompt: { uz: '', ru: '' },
      choices: [
        {
          id: 'a',
          text: { uz: 'A', ru: 'A' },
          nextNodeId: 'good',
          effects: [{ type: 'add_score', dimension: 'rapport', amount: 15 }],
        },
        {
          id: 'b',
          text: { uz: 'B', ru: 'B' },
          nextNodeId: 'bad',
          effects: [{ type: 'add_score', dimension: 'rapport', amount: -5 }],
        },
        {
          id: 'c',
          text: { uz: 'C', ru: 'C' },
          nextNodeId: 'hidden',
          effects: [{ type: 'set_flag', flag: 'found_secret' }],
          condition: { type: 'flag', flag: 'has_clue' },
        },
      ],
    },
    good: {
      id: 'good',
      type: 'end',
      outcome: 'success',
      effects: [{ type: 'add_xp', amount: 100 }],
    },
    bad: {
      id: 'bad',
      type: 'end',
      outcome: 'failure',
      effects: [{ type: 'lose_life' }],
    },
    hidden: {
      id: 'hidden',
      type: 'end',
      outcome: 'hidden_ending',
      effects: [
        { type: 'gain_life' },
        { type: 'unlock_achievement', id: 'test_hidden' },
      ],
    },
    branch1: {
      id: 'branch1',
      type: 'condition_branch',
      branches: [
        { condition: { type: 'score_gte', value: 20 }, nextNodeId: 'good' },
        { condition: { type: 'flag', flag: 'some_flag' }, nextNodeId: 'hidden' },
      ],
      fallbackNodeId: 'bad',
    },
    score1: {
      id: 'score1',
      type: 'score',
      effects: [{ type: 'add_score', dimension: 'empathy', amount: 10 }],
      nextNodeId: 'choice1',
    },
    multi1: {
      id: 'multi1',
      type: 'choice',
      prompt: { uz: '', ru: '' },
      multiSelect: { count: 2 },
      choices: [
        {
          id: 'x',
          text: { uz: 'X', ru: 'X' },
          nextNodeId: 'good',
          effects: [{ type: 'set_flag', flag: 'chose_x' }],
        },
        {
          id: 'y',
          text: { uz: 'Y', ru: 'Y' },
          nextNodeId: 'good',
          effects: [{ type: 'set_flag', flag: 'chose_y' }],
        },
        {
          id: 'z',
          text: { uz: 'Z', ru: 'Z' },
          nextNodeId: 'good',
          effects: [{ type: 'set_flag', flag: 'chose_z' }],
        },
      ],
    },
  },
};

// ============================================================
// resolveNode (4 tests)
// ============================================================

describe('resolveNode', () => {
  it('1. returns correct node by ID', () => {
    const node = resolveNode('start', testDay);
    expect(node.id).toBe('start');
  });

  it('2. throws for non-existent nodeId', () => {
    expect(() => resolveNode('nonexistent', testDay)).toThrow(
      'Node "nonexistent" not found in day "test-day"',
    );
  });

  it('3. returns dialogue node type', () => {
    const node = resolveNode('start', testDay);
    expect(node.type).toBe('dialogue');
  });

  it('4. returns choice node type', () => {
    const node = resolveNode('choice1', testDay);
    expect(node.type).toBe('choice');
  });
});

// ============================================================
// applyEffects (16 tests)
// ============================================================

describe('applyEffects', () => {
  it('5. add_score adds to correct dimension', () => {
    const state = makeState();
    const effects: Effect[] = [{ type: 'add_score', dimension: 'rapport', amount: 15 }];
    const result = applyEffects(effects, state);
    expect(result.state.score.dimensions.rapport).toBe(15);
  });

  it('6. add_score adds to total', () => {
    const state = makeState();
    const effects: Effect[] = [{ type: 'add_score', dimension: 'rapport', amount: 15 }];
    const result = applyEffects(effects, state);
    expect(result.state.score.total).toBe(15);
  });

  it('7. multiple add_score in different dimensions', () => {
    const state = makeState();
    const effects: Effect[] = [
      { type: 'add_score', dimension: 'rapport', amount: 10 },
      { type: 'add_score', dimension: 'empathy', amount: 5 },
    ];
    const result = applyEffects(effects, state);
    expect(result.state.score.dimensions.rapport).toBe(10);
    expect(result.state.score.dimensions.empathy).toBe(5);
    expect(result.state.score.total).toBe(15);
  });

  it('8. add_score with negative amount (penalty)', () => {
    const state = makeState({
      score: { total: 20, dimensions: { ...createEmptyDimensionScores(), rapport: 20 } },
    });
    const effects: Effect[] = [{ type: 'add_score', dimension: 'rapport', amount: -5 }];
    const result = applyEffects(effects, state);
    expect(result.state.score.dimensions.rapport).toBe(15);
    expect(result.state.score.total).toBe(15);
  });

  it('9. lose_life decrements from 3 to 2', () => {
    const state = makeState({ lives: 3 });
    const effects: Effect[] = [{ type: 'lose_life' }];
    const result = applyEffects(effects, state);
    expect(result.state.lives).toBe(2);
  });

  it('10. lose_life at 0 stays at 0', () => {
    const state = makeState({ lives: 0 });
    const effects: Effect[] = [{ type: 'lose_life' }];
    const result = applyEffects(effects, state);
    expect(result.state.lives).toBe(0);
  });

  it('11. gain_life increments from 3 to 4', () => {
    const state = makeState({ lives: 3 });
    const effects: Effect[] = [{ type: 'gain_life' }];
    const result = applyEffects(effects, state);
    expect(result.state.lives).toBe(4);
  });

  it('12. gain_life at maxLives (5) stays at 5', () => {
    const state = makeState({ lives: 5, maxLives: 5 });
    const effects: Effect[] = [{ type: 'gain_life' }];
    const result = applyEffects(effects, state);
    expect(result.state.lives).toBe(5);
  });

  it('13. set_flag sets flag to true', () => {
    const state = makeState();
    const effects: Effect[] = [{ type: 'set_flag', flag: 'found_secret' }];
    const result = applyEffects(effects, state);
    expect(result.state.flags.found_secret).toBe(true);
  });

  it('14. unlock_achievement adds to playerState', () => {
    const state = makeState();
    const player = makePlayer();
    const effects: Effect[] = [{ type: 'unlock_achievement', id: 'first_sale' }];
    const result = applyEffects(effects, state, player);
    expect(result.playerState?.achievements).toContain('first_sale');
  });

  it('15. unlock_achievement deduplicates', () => {
    const state = makeState();
    const player = makePlayer({ achievements: ['first_sale'] });
    const effects: Effect[] = [{ type: 'unlock_achievement', id: 'first_sale' }];
    const result = applyEffects(effects, state, player);
    expect(
      result.playerState?.achievements.filter((a) => a === 'first_sale').length,
    ).toBe(1);
  });

  it('16. add_xp adds to playerState', () => {
    const state = makeState();
    const player = makePlayer({ totalXp: 50 });
    const effects: Effect[] = [{ type: 'add_xp', amount: 100 }];
    const result = applyEffects(effects, state, player);
    expect(result.playerState?.totalXp).toBe(150);
  });

  it('17. add_coins adds to playerState', () => {
    const state = makeState();
    const player = makePlayer({ coins: 10 });
    const effects: Effect[] = [{ type: 'add_coins', amount: 25 }];
    const result = applyEffects(effects, state, player);
    expect(result.playerState?.coins).toBe(35);
  });

  it('18. play_sound does not change state', () => {
    const state = makeState();
    const player = makePlayer();
    const effects: Effect[] = [{ type: 'play_sound', soundId: 'click' }];
    const result = applyEffects(effects, state, player);
    expect(result.state.score.total).toBe(state.score.total);
    expect(result.state.lives).toBe(state.lives);
    expect(result.playerState?.totalXp).toBe(player.totalXp);
  });

  it('19. empty effects array returns unchanged state', () => {
    const state = makeState();
    const result = applyEffects([], state);
    expect(result.state.score.total).toBe(0);
    expect(result.state.lives).toBe(3);
    expect(result.state.flags).toEqual({});
  });

  it('20. immutability: original state not modified', () => {
    const state = makeState();
    const player = makePlayer();
    const originalTotal = state.score.total;
    const originalLives = state.lives;
    const originalXp = player.totalXp;

    const effects: Effect[] = [
      { type: 'add_score', dimension: 'rapport', amount: 15 },
      { type: 'lose_life' },
      { type: 'add_xp', amount: 100 },
      { type: 'set_flag', flag: 'test' },
    ];
    applyEffects(effects, state, player);

    expect(state.score.total).toBe(originalTotal);
    expect(state.lives).toBe(originalLives);
    expect(player.totalXp).toBe(originalXp);
    expect(state.flags).toEqual({});
    expect(state.score.dimensions.rapport).toBe(0);
  });
});

// ============================================================
// processNode (6 tests)
// ============================================================

describe('processNode', () => {
  it('21. condition_branch: first matching branch taken', () => {
    const state = makeState({
      score: {
        total: 25,
        dimensions: { ...createEmptyDimensionScores(), rapport: 25 },
      },
    });
    const node = resolveNode('branch1', testDay);
    const result = processNode(node, state);
    expect(result.nextNodeId).toBe('good');
  });

  it('22. condition_branch: fallback when no match', () => {
    const state = makeState(); // score 0, no flags
    const node = resolveNode('branch1', testDay);
    const result = processNode(node, state);
    expect(result.nextNodeId).toBe('bad');
  });

  it('23. condition_branch: multiple matching takes FIRST', () => {
    const state = makeState({
      score: {
        total: 25,
        dimensions: { ...createEmptyDimensionScores(), rapport: 25 },
      },
      flags: { some_flag: true },
    });
    const node = resolveNode('branch1', testDay);
    const result = processNode(node, state);
    // Both branches match, but first (score_gte) should win
    expect(result.nextNodeId).toBe('good');
  });

  it('24. score node: applies effects and returns nextNodeId', () => {
    const state = makeState();
    const node = resolveNode('score1', testDay);
    const result = processNode(node, state);
    expect(result.nextNodeId).toBe('choice1');
    expect(result.state.score.dimensions.empathy).toBe(10);
    expect(result.state.score.total).toBe(10);
  });

  it('25. dialogue node: returns null (waits for user)', () => {
    const state = makeState();
    const node = resolveNode('start', testDay);
    const result = processNode(node, state);
    expect(result.nextNodeId).toBeNull();
  });

  it('26. choice node: returns null (waits for user)', () => {
    const state = makeState();
    const node = resolveNode('choice1', testDay);
    const result = processNode(node, state);
    expect(result.nextNodeId).toBeNull();
  });
});

// ============================================================
// makeChoice (5 tests)
// ============================================================

describe('makeChoice', () => {
  const choiceNode = testDay.nodes['choice1'] as ChoiceNode;

  it('27. choice index 0 returns correct nextNodeId + applies effects', () => {
    const state = makeState();
    const result = makeChoice(0, choiceNode, state);
    expect(result.nextNodeId).toBe('good');
    expect(result.state.score.dimensions.rapport).toBe(15);
    expect(result.state.score.total).toBe(15);
  });

  it('28. choice index 1 (second choice) works', () => {
    const state = makeState();
    const result = makeChoice(1, choiceNode, state);
    expect(result.nextNodeId).toBe('bad');
    expect(result.state.score.dimensions.rapport).toBe(-5);
  });

  it('29. records in choiceHistory', () => {
    const state = makeState();
    const result = makeChoice(0, choiceNode, state);
    expect(result.state.choiceHistory).toHaveLength(1);
    expect(result.state.choiceHistory[0].nodeId).toBe('choice1');
    expect(result.state.choiceHistory[0].choiceIndex).toBe(0);
    expect(typeof result.state.choiceHistory[0].timestamp).toBe('number');
  });

  it('30. throws for out-of-bounds index', () => {
    const state = makeState();
    expect(() => makeChoice(5, choiceNode, state)).toThrow(/out of bounds/);
    expect(() => makeChoice(-1, choiceNode, state)).toThrow(/out of bounds/);
  });

  it('31. applies multiple effects from one choice', () => {
    // Create a custom choice node with multiple effects on one choice
    const multiEffectNode: ChoiceNode = {
      id: 'multi-effect',
      type: 'choice',
      prompt: { uz: '', ru: '' },
      choices: [
        {
          id: 'a',
          text: { uz: 'A', ru: 'A' },
          nextNodeId: 'good',
          effects: [
            { type: 'add_score', dimension: 'rapport', amount: 10 },
            { type: 'add_score', dimension: 'empathy', amount: 5 },
            { type: 'set_flag', flag: 'polite' },
          ],
        },
      ],
    };
    const state = makeState();
    const result = makeChoice(0, multiEffectNode, state);
    expect(result.state.score.dimensions.rapport).toBe(10);
    expect(result.state.score.dimensions.empathy).toBe(5);
    expect(result.state.score.total).toBe(15);
    expect(result.state.flags.polite).toBe(true);
  });
});

// ============================================================
// makeMultiChoice (3 tests)
// ============================================================

describe('makeMultiChoice', () => {
  const multiNode = testDay.nodes['multi1'] as ChoiceNode;

  it('32. selects 2 of 3, applies both effects', () => {
    const state = makeState();
    const result = makeMultiChoice([0, 1], multiNode, state);
    expect(result.state.flags.chose_x).toBe(true);
    expect(result.state.flags.chose_y).toBe(true);
    expect(result.state.flags.chose_z).toBeUndefined();
  });

  it('33. sets flags for all selected choices', () => {
    const state = makeState();
    const result = makeMultiChoice([0, 2], multiNode, state);
    expect(result.state.flags.chose_x).toBe(true);
    expect(result.state.flags.chose_z).toBe(true);
  });

  it('34. returns nextNodeId of last selected', () => {
    const state = makeState();
    const result = makeMultiChoice([0, 2], multiNode, state);
    // Last selected is index 2 (choice 'z') with nextNodeId 'good'
    expect(result.nextNodeId).toBe('good');
  });
});

// ============================================================
// getAvailableChoices (3 tests)
// ============================================================

describe('getAvailableChoices', () => {
  const choiceNode = testDay.nodes['choice1'] as ChoiceNode;

  it('35. returns all choices when no conditions (or conditions met)', () => {
    // Choices 'a' and 'b' have no condition, 'c' has condition requiring has_clue flag
    // Without the flag, only a and b are available
    const state = makeState();
    const available = getAvailableChoices(choiceNode, state);
    // 'a' and 'b' have no condition → included; 'c' has condition (flag has_clue) → excluded
    expect(available).toHaveLength(2);
    expect(available.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('36. filters out choices with false conditions', () => {
    const state = makeState({ flags: {} }); // has_clue is not set
    const available = getAvailableChoices(choiceNode, state);
    const ids = available.map((c) => c.id);
    expect(ids).not.toContain('c');
  });

  it('37. shows choice when condition is true (flag set)', () => {
    const state = makeState({ flags: { has_clue: true } });
    const available = getAvailableChoices(choiceNode, state);
    expect(available).toHaveLength(3);
    expect(available.map((c) => c.id)).toContain('c');
  });
});

// ============================================================
// initDaySession (5 tests)
// ============================================================

describe('initDaySession', () => {
  it('38. creates state with 3 lives by default', () => {
    const session = initDaySession('car-scenario', testDay);
    expect(session.lives).toBe(3);
  });

  it('39. sets currentNodeId to rootNodeId', () => {
    const session = initDaySession('car-scenario', testDay);
    expect(session.currentNodeId).toBe('start');
  });

  it('40. inherits lives from previous state', () => {
    const session = initDaySession('car-scenario', testDay, {
      lives: 2,
      flags: {},
    });
    expect(session.lives).toBe(2);
  });

  it('41. inherits cross-day flags (d1_success, d2_hidden)', () => {
    const session = initDaySession('car-scenario', testDay, {
      lives: 3,
      flags: {
        d1_success: true,
        d2_hidden: true,
        some_flag: true,
      },
    });
    expect(session.flags.d1_success).toBe(true);
    expect(session.flags.d2_hidden).toBe(true);
  });

  it('42. does NOT inherit non-cross-day flags (some_flag)', () => {
    const session = initDaySession('car-scenario', testDay, {
      lives: 3,
      flags: {
        d1_success: true,
        some_flag: true,
        found_secret: true,
      },
    });
    expect(session.flags.some_flag).toBeUndefined();
    expect(session.flags.found_secret).toBeUndefined();
    expect(session.flags.d1_success).toBe(true);
  });
});
