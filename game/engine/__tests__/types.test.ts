import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  ScenarioNode, DialogueNode, ChoiceNode, DayIntroNode,
  ConditionBranchNode, ScoreNode, TimerStartNode, EndNode,
  Condition, Effect, GameEvent,
  GameSessionState, PlayerState, DimensionScores,
  ScoreDimension, Rating, DayOutcome, LocalizedText,
  Day, Scenario, ChoiceOption, TimerState, DifficultyModifier,
  CompletedScenarioRecord,
} from '../types';
import { SCORE_DIMENSIONS, RATINGS } from '../types';

describe('types — compile-time validation', () => {
  // 3.1 Base types
  it('ScoreDimension has exactly 7 values', () => {
    expect(SCORE_DIMENSIONS).toHaveLength(7);
    expect(SCORE_DIMENSIONS).toContain('empathy');
    expect(SCORE_DIMENSIONS).toContain('rapport');
    expect(SCORE_DIMENSIONS).toContain('timing');
    expect(SCORE_DIMENSIONS).toContain('expertise');
    expect(SCORE_DIMENSIONS).toContain('persuasion');
    expect(SCORE_DIMENSIONS).toContain('discovery');
    expect(SCORE_DIMENSIONS).toContain('opportunity');
  });

  it('Rating has 6 values in correct order', () => {
    expect(RATINGS).toEqual(['S', 'A', 'B', 'C', 'D', 'F']);
  });

  it('DayOutcome includes partial', () => {
    const outcomes: DayOutcome[] = ['success', 'partial', 'failure', 'hidden_ending'];
    expectTypeOf(outcomes).toMatchTypeOf<DayOutcome[]>();
  });

  it('LocalizedText requires both uz and ru', () => {
    const text: LocalizedText = { uz: 'test', ru: 'тест' };
    expect(text.uz).toBe('test');
    expect(text.ru).toBe('тест');
  });

  // 3.2 ScenarioNode variants
  it('dialogue node narrows correctly', () => {
    const node: ScenarioNode = {
      id: 'n1', type: 'dialogue',
      speaker: 'rustam', emotion: 'friendly',
      text: { uz: 'Salom', ru: 'Привет' },
      nextNodeId: 'n2',
    };
    if (node.type === 'dialogue') {
      expect(node.speaker).toBe('rustam');
      expect(node.nextNodeId).toBe('n2');
    }
  });

  it('choice node with multiSelect compiles', () => {
    const node: ChoiceNode = {
      id: 'c1', type: 'choice',
      prompt: { uz: 'Tanlang', ru: 'Выберите' },
      choices: [
        { id: 'a', text: { uz: 'A', ru: 'A' }, nextNodeId: 'n1', effects: [] },
        { id: 'b', text: { uz: 'B', ru: 'B' }, nextNodeId: 'n2', effects: [] },
        { id: 'c', text: { uz: 'C', ru: 'C' }, nextNodeId: 'n3', effects: [] },
      ],
      multiSelect: { count: 2 },
    };
    expect(node.multiSelect?.count).toBe(2);
    expect(node.choices).toHaveLength(3);
  });

  it('choice option with condition compiles', () => {
    const option: ChoiceOption = {
      id: 'secret',
      text: { uz: 'Maxfiy', ru: 'Секрет' },
      nextNodeId: 'hidden',
      effects: [{ type: 'set_flag', flag: 'found_secret' }],
      condition: { type: 'flag', flag: 'has_clue' },
    };
    expect(option.condition?.type).toBe('flag');
  });

  it('day_intro node compiles', () => {
    const node: DayIntroNode = {
      id: 'intro', type: 'day_intro',
      background: 'bg_showroom',
      title: { uz: 'Kun 1', ru: 'День 1' },
      nextNodeId: 'briefing',
    };
    expect(node.background).toBe('bg_showroom');
  });

  it('condition_branch requires fallback', () => {
    const node: ConditionBranchNode = {
      id: 'br', type: 'condition_branch',
      branches: [
        { condition: { type: 'score_gte', value: 90 }, nextNodeId: 'win' },
      ],
      fallbackNodeId: 'lose',
    };
    expect(node.fallbackNodeId).toBe('lose');
  });

  it('score node with narrator compiles', () => {
    const node: ScoreNode = {
      id: 'sc', type: 'score',
      effects: [{ type: 'add_score', dimension: 'empathy', amount: 10 }],
      nextNodeId: 'next',
      narrator: { uz: 'Yaxshi', ru: 'Хорошо' },
    };
    expect(node.narrator?.ru).toBe('Хорошо');
  });

  it('end node with all outcome types', () => {
    const outcomes: DayOutcome[] = ['success', 'partial', 'failure', 'hidden_ending'];
    for (const outcome of outcomes) {
      const node: EndNode = {
        id: `end_${outcome}`, type: 'end',
        outcome, effects: [],
      };
      expect(node.outcome).toBe(outcome);
    }
  });

  // 3.3 Conditions
  it('nested AND/OR/NOT condition compiles', () => {
    const cond: Condition = {
      type: 'and',
      conditions: [
        { type: 'flag', flag: 'patient_approach' },
        { type: 'or', conditions: [
          { type: 'score_gte', value: 63 },
          { type: 'not', condition: { type: 'flag', flag: 'bad' } },
        ]},
      ],
    };
    if (cond.type === 'and') {
      expect(cond.conditions).toHaveLength(2);
    }
  });

  // 3.4 Effects
  it('all 9 effect types compile', () => {
    const effects: Effect[] = [
      { type: 'add_score', dimension: 'rapport', amount: 15 },
      { type: 'lose_life' },
      { type: 'gain_life' },
      { type: 'set_flag', flag: 'd1_success' },
      { type: 'unlock_achievement', id: 'first_contact' },
      { type: 'add_xp', amount: 100 },
      { type: 'add_coins', amount: 2 },
      { type: 'add_bonus', bonusType: 'speed', multiplier: 1.1 },
      { type: 'play_sound', soundId: 'sfx_correct' },
    ];
    expect(effects).toHaveLength(9);
  });

  // 3.5 GameEvents
  it('key game events compile', () => {
    const events: GameEvent[] = [
      { type: 'score_changed', dimension: 'empathy', amount: 10, newTotal: 25 },
      { type: 'life_lost', remainingLives: 2 },
      { type: 'life_gained', remainingLives: 4 },
      { type: 'achievement_unlocked', achievementId: 'first_contact', xpReward: 50 },
      { type: 'combo_activated', comboCount: 4, multiplier: 1.5 },
      { type: 'combo_reset' },
      { type: 'day_completed', dayIndex: 0, score: 44, rating: 'S', isHidden: false },
      { type: 'game_over', dayIndex: 2, totalScore: 15 },
      { type: 'near_miss', currentRating: 'A', nextRating: 'S', pointsNeeded: 1 },
      { type: 'timer_warning', remaining: 5 },
      { type: 'timer_expired', nodeId: 'd1_approach' },
      { type: 'coins_changed', amount: 2, newTotal: 5 },
      { type: 'sound_requested', soundId: 'sfx_achievement' },
    ];
    expect(events).toHaveLength(13);
  });

  // 3.6 State
  it('GameSessionState has all required fields', () => {
    const state: GameSessionState = {
      scenarioId: 'car-dealership',
      dayIndex: 0,
      currentNodeId: 'd1_intro',
      score: {
        total: 0,
        dimensions: {
          empathy: 0, rapport: 0, timing: 0,
          expertise: 0, persuasion: 0, discovery: 0, opportunity: 0,
        },
      },
      lives: 3,
      maxLives: 5,
      flags: {},
      choiceHistory: [],
      comboCount: 0,
      timerState: null,
      isReplay: false,
      isGameOverRestart: false,
      startTime: Date.now(),
      difficulty: { timerOffset: 0, showHints: false, removeWorstChoice: false },
    };
    expect(state.lives).toBe(3);
    expect(state.maxLives).toBe(5);
    expect(state.isGameOverRestart).toBe(false);
  });

  it('PlayerState has coins field', () => {
    const player: PlayerState = {
      id: 'uuid-123',
      phone: '+998901234567',
      displayName: 'Test',
      avatarId: 'male',
      level: 1,
      totalXp: 0,
      totalScore: 0,
      coins: 0,
      achievements: [],
      completedScenarios: [],
    };
    expect(player.coins).toBe(0);
    expect(player.avatarId).toBe('male');
  });

  // 3.7 Scenario & Day
  it('Day with nextDayTeaser compiles', () => {
    const day: Day = {
      id: 'car-day1',
      dayNumber: 1,
      title: { uz: 'Birinchi mijoz', ru: 'Первый клиент' },
      rootNodeId: 'd1_intro',
      targetScore: 30,
      nodes: {},
      nextDayTeaser: { uz: 'Ertaga...', ru: 'Завтра...' },
    };
    expect(day.nextDayTeaser?.uz).toBe('Ertaga...');
  });
});
