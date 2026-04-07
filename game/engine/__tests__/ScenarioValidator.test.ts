import { describe, it, expect } from 'vitest';
import type {
  Day,
  Scenario,
  ScenarioNode,
  ChoiceNode,
  DialogueNode,
  EndNode,
  ConditionBranchNode,
  TimerStartNode,
  ScoreNode,
  DayIntroNode,
} from '../types';
import { validateDay, validateScenario } from '../ScenarioValidator';

// ============================================================
// Fixtures
// ============================================================

/** Valid minimal day: start → choice(A→end_good, B→end_bad) */
const validDay: Day = {
  id: 'valid',
  dayNumber: 1,
  title: { uz: 'Test', ru: 'Тест' },
  rootNodeId: 'start',
  targetScore: 10,
  nodes: {
    start: {
      id: 'start',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      text: { uz: 'Hi', ru: 'Привет' },
      nextNodeId: 'choice',
    } satisfies DialogueNode,
    choice: {
      id: 'choice',
      type: 'choice',
      prompt: { uz: 'Pick', ru: 'Выбери' },
      choices: [
        {
          id: 'a',
          text: { uz: 'A', ru: 'A' },
          nextNodeId: 'end_good',
          effects: [{ type: 'add_score', dimension: 'rapport', amount: 12 }],
        },
        {
          id: 'b',
          text: { uz: 'B', ru: 'B' },
          nextNodeId: 'end_bad',
          effects: [{ type: 'add_score', dimension: 'rapport', amount: 2 }],
        },
      ],
    } satisfies ChoiceNode,
    end_good: {
      id: 'end_good',
      type: 'end',
      outcome: 'success',
      effects: [],
    } satisfies EndNode,
    end_bad: {
      id: 'end_bad',
      type: 'end',
      outcome: 'failure',
      effects: [],
    } satisfies EndNode,
  },
};

/** Helper: deep-clone a Day for mutation in tests */
function cloneDay(day: Day): Day {
  return JSON.parse(JSON.stringify(day));
}

// ============================================================
// 1. Valid day passes
// ============================================================

describe('ScenarioValidator — validateDay', () => {
  it('1. valid day passes with no errors and no warnings', () => {
    const result = validateDay(validDay);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  // ============================================================
  // 2. Missing rootNodeId
  // ============================================================

  it('2. missing rootNodeId → error', () => {
    const day = cloneDay(validDay);
    day.rootNodeId = 'nonexistent';
    const result = validateDay(day);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /rootNodeId/.test(e))).toBe(true);
  });

  // ============================================================
  // 3. Dead-end reference (dialogue nextNodeId)
  // ============================================================

  it('3. dialogue nextNodeId points to nonexistent node → error', () => {
    const day = cloneDay(validDay);
    (day.nodes['start'] as DialogueNode).nextNodeId = 'ghost';
    const result = validateDay(day);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /ghost/.test(e))).toBe(true);
  });

  // ============================================================
  // 4. Missing fallbackNodeId in condition_branch
  // ============================================================

  it('4. missing fallbackNodeId in condition_branch → error', () => {
    const day = cloneDay(validDay);
    // Replace choice with a condition_branch that has a bad fallback
    day.nodes['cond'] = {
      id: 'cond',
      type: 'condition_branch',
      branches: [
        {
          condition: { type: 'score_gte', value: 5 },
          nextNodeId: 'end_good',
        },
      ],
      fallbackNodeId: 'does_not_exist',
    } satisfies ConditionBranchNode;
    (day.nodes['start'] as DialogueNode).nextNodeId = 'cond';
    const result = validateDay(day);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /does_not_exist/.test(e))).toBe(true);
  });

  // ============================================================
  // 4b. Missing branch nextNodeId in condition_branch
  // ============================================================

  it('4b. condition_branch branch nextNodeId missing → error', () => {
    const day = cloneDay(validDay);
    day.nodes['cond'] = {
      id: 'cond',
      type: 'condition_branch',
      branches: [
        {
          condition: { type: 'score_gte', value: 5 },
          nextNodeId: 'missing_branch_target',
        },
      ],
      fallbackNodeId: 'end_good',
    } satisfies ConditionBranchNode;
    (day.nodes['start'] as DialogueNode).nextNodeId = 'cond';
    const result = validateDay(day);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /missing_branch_target/.test(e))).toBe(true);
  });

  // ============================================================
  // 5. Unreachable (orphan) node → warning
  // ============================================================

  it('5. orphan node not reachable from rootNodeId → warning', () => {
    const day = cloneDay(validDay);
    day.nodes['orphan'] = {
      id: 'orphan',
      type: 'dialogue',
      speaker: 'narrator',
      emotion: null,
      text: { uz: 'Nobody sees me', ru: 'Никто меня не видит' },
      nextNodeId: 'end_good',
    } satisfies DialogueNode;
    const result = validateDay(day);
    // Orphan is a warning, not an error
    expect(result.warnings.some((w) => /orphan/.test(w))).toBe(true);
    // Day is still valid structurally (connected graph is fine)
    expect(result.valid).toBe(true);
  });

  // ============================================================
  // 6. Cycle detection
  // ============================================================

  it('6. cycle without reaching end → error', () => {
    const day: Day = {
      id: 'cycle',
      dayNumber: 1,
      title: { uz: 'Cycle', ru: 'Цикл' },
      rootNodeId: 'a',
      targetScore: 10,
      nodes: {
        a: {
          id: 'a',
          type: 'dialogue',
          speaker: 'narrator',
          emotion: null,
          text: { uz: 'A', ru: 'A' },
          nextNodeId: 'b',
        } satisfies DialogueNode,
        b: {
          id: 'b',
          type: 'dialogue',
          speaker: 'narrator',
          emotion: null,
          text: { uz: 'B', ru: 'B' },
          nextNodeId: 'a',
        } satisfies DialogueNode,
      },
    };
    const result = validateDay(day);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /[Cc]ycle/.test(e))).toBe(true);
  });

  // ============================================================
  // 7. S-rating achievable — no warning
  // ============================================================

  it('7. S-rating achievable (best path >= 90% target) → no warning', () => {
    // validDay: best path gives 12 points, target 10 → 120% → S achievable
    const result = validateDay(validDay);
    expect(result.warnings.some((w) => /S-rating/.test(w))).toBe(false);
  });

  // ============================================================
  // 8. S-rating NOT achievable → warning
  // ============================================================

  it('8. S-rating not achievable (all paths below 90%) → warning', () => {
    const day = cloneDay(validDay);
    day.targetScore = 100; // impossible with max 12 points
    const result = validateDay(day);
    expect(result.warnings.some((w) => /S-rating/.test(w))).toBe(true);
  });

  // ============================================================
  // 9. Choice with < 2 options → warning
  // ============================================================

  it('9. choice node with < 2 choices → warning', () => {
    const day = cloneDay(validDay);
    (day.nodes['choice'] as ChoiceNode).choices = [
      {
        id: 'only',
        text: { uz: 'Only', ru: 'Единственный' },
        nextNodeId: 'end_good',
        effects: [{ type: 'add_score', dimension: 'rapport', amount: 12 }],
      },
    ];
    const result = validateDay(day);
    expect(result.warnings.some((w) => /choice.*fewer than 2|less than 2|< 2|at least 2/i.test(w))).toBe(true);
  });

  // ============================================================
  // 10. multiSelect with insufficient options → warning
  // ============================================================

  it('10. multiSelect node count:2 but only 2 choices → warning', () => {
    const day = cloneDay(validDay);
    (day.nodes['choice'] as ChoiceNode).multiSelect = { count: 2 };
    // validDay.choice has exactly 2 choices, need count+1=3
    const result = validateDay(day);
    expect(result.warnings.some((w) => /multiSelect/i.test(w))).toBe(true);
  });

  // ============================================================
  // 11. Empty text fields → warning
  // ============================================================

  it('11. empty text field (uz or ru) → warning', () => {
    const day = cloneDay(validDay);
    (day.nodes['start'] as DialogueNode).text.uz = '';
    const result = validateDay(day);
    expect(result.warnings.some((w) => /empty.*text|text.*empty/i.test(w))).toBe(true);
  });

  // ============================================================
  // 12. Invalid score dimension → warning
  // ============================================================

  it('12. invalid score dimension in add_score effect → warning', () => {
    const day = cloneDay(validDay);
    const choiceNode = day.nodes['choice'] as ChoiceNode;
    // Force an invalid dimension via type assertion
    (choiceNode.choices[0].effects[0] as any).dimension = 'charisma';
    const result = validateDay(day);
    expect(result.warnings.some((w) => /dimension.*charisma|charisma.*dimension/i.test(w))).toBe(true);
  });

  // ============================================================
  // Additional structural checks
  // ============================================================

  it('score node nextNodeId missing → error', () => {
    const day = cloneDay(validDay);
    day.nodes['score_node'] = {
      id: 'score_node',
      type: 'score',
      effects: [{ type: 'add_score', dimension: 'rapport', amount: 5 }],
      nextNodeId: 'nonexistent_score_target',
    } satisfies ScoreNode;
    (day.nodes['start'] as DialogueNode).nextNodeId = 'score_node';
    const result = validateDay(day);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /nonexistent_score_target/.test(e))).toBe(true);
  });

  it('timer_start expireNodeId missing → error', () => {
    const day = cloneDay(validDay);
    day.nodes['timer'] = {
      id: 'timer',
      type: 'timer_start',
      duration: 10,
      expireNodeId: 'nonexistent_expire',
      nextNodeId: 'choice',
    } satisfies TimerStartNode;
    (day.nodes['start'] as DialogueNode).nextNodeId = 'timer';
    const result = validateDay(day);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /nonexistent_expire/.test(e))).toBe(true);
  });

  it('day_intro nextNodeId missing → error', () => {
    const day = cloneDay(validDay);
    day.nodes['intro'] = {
      id: 'intro',
      type: 'day_intro',
      background: 'bg.jpg',
      title: { uz: 'Day 1', ru: 'День 1' },
      nextNodeId: 'nonexistent_intro_target',
    } satisfies DayIntroNode;
    (day.nodes['start'] as DialogueNode).nextNodeId = 'intro';
    const result = validateDay(day);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /nonexistent_intro_target/.test(e))).toBe(true);
  });

  it('choice option nextNodeId missing → error', () => {
    const day = cloneDay(validDay);
    (day.nodes['choice'] as ChoiceNode).choices[0].nextNodeId = 'missing_choice_target';
    const result = validateDay(day);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /missing_choice_target/.test(e))).toBe(true);
  });

  it('choice expireNodeId missing → error', () => {
    const day = cloneDay(validDay);
    (day.nodes['choice'] as ChoiceNode).expireNodeId = 'missing_expire';
    const result = validateDay(day);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /missing_expire/.test(e))).toBe(true);
  });
});

// ============================================================
// 13. validateScenario
// ============================================================

describe('ScenarioValidator — validateScenario', () => {
  it('13. scenario with valid day → valid result', () => {
    const scenario: Scenario = {
      id: 'test-scenario',
      productId: 'car',
      title: { uz: 'Test', ru: 'Тест' },
      description: { uz: 'Desc', ru: 'Описание' },
      days: [validDay],
      requiredLevel: 1,
    };
    const result = validateScenario(scenario);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('scenario with invalid day → aggregates errors', () => {
    const badDay = cloneDay(validDay);
    badDay.rootNodeId = 'nonexistent';
    const scenario: Scenario = {
      id: 'test-scenario',
      productId: 'car',
      title: { uz: 'Test', ru: 'Тест' },
      description: { uz: 'Desc', ru: 'Описание' },
      days: [validDay, badDay],
      requiredLevel: 1,
    };
    const result = validateScenario(scenario);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('scenario with no days → error', () => {
    const scenario: Scenario = {
      id: 'empty',
      productId: 'car',
      title: { uz: 'Test', ru: 'Тест' },
      description: { uz: 'Desc', ru: 'Описание' },
      days: [],
      requiredLevel: 1,
    };
    const result = validateScenario(scenario);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /no days|empty/i.test(e))).toBe(true);
  });
});
