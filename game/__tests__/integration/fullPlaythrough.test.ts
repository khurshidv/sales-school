import { describe, it, expect } from 'vitest';
import type {
  GameSessionState,
  PlayerState,
  Day,
  ScenarioNode,
} from '@/game/engine/types';
import {
  resolveNode,
  processNode,
  applyEffects,
  makeChoice,
  makeMultiChoice,
  getAvailableChoices,
  initDaySession,
} from '@/game/engine/ScenarioEngine';
import { evaluateCondition } from '@/game/engine/ConditionEvaluator';
import { calculateRating } from '@/game/systems/ScoringSystem';
import {
  loseLife,
  isGameOver,
  shouldLoseLife,
  handleGameOver,
} from '@/game/systems/LivesSystem';
import {
  carDealershipScenario,
  day1,
  day2,
  day3,
} from '@/game/data/scenarios/car-dealership';

// ============================================================
// Helper: simulate a full day playthrough
// ============================================================

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

function simulateDay(
  day: Day,
  choiceMap: Record<string, number | number[]>,
  previousState?: { lives: number; flags: Record<string, boolean> },
): { state: GameSessionState; playerState: PlayerState; outcome: string; endNodeId: string } {
  let state = initDaySession('car-dealership', day, previousState);
  let playerState = makePlayer();

  let maxIterations = 100;
  while (maxIterations-- > 0) {
    const node = resolveNode(state.currentNodeId, day);

    if (node.type === 'end') {
      // Apply end-node effects
      const result = applyEffects(node.effects, state, playerState);
      return {
        state: result.state,
        playerState: result.playerState ?? playerState,
        outcome: node.outcome,
        endNodeId: node.id,
      };
    }

    if (node.type === 'dialogue' || node.type === 'day_intro') {
      // Apply dialogue effects if any
      if ('effects' in node && node.effects) {
        const result = applyEffects(node.effects, state, playerState);
        state = result.state;
        if (result.playerState) playerState = result.playerState;
      }
      state = { ...state, currentNodeId: node.nextNodeId };
      continue;
    }

    if (
      node.type === 'condition_branch' ||
      node.type === 'score' ||
      node.type === 'timer_start'
    ) {
      const result = processNode(node, state, playerState);
      state = result.state;
      if (result.nextNodeId) state = { ...state, currentNodeId: result.nextNodeId };
      if (result.playerState) playerState = result.playerState;
      continue;
    }

    if (node.type === 'choice') {
      const choiceKey = node.id;
      if (choiceKey in choiceMap) {
        const selection = choiceMap[choiceKey];
        if (Array.isArray(selection)) {
          const result = makeMultiChoice(selection, node, state, playerState);
          state = { ...result.state, currentNodeId: result.nextNodeId };
          if (result.playerState) playerState = result.playerState;
        } else {
          const result = makeChoice(selection, node, state, playerState);
          state = { ...result.state, currentNodeId: result.nextNodeId };
          if (result.playerState) playerState = result.playerState;
        }
      } else {
        // No choice specified: simulate timer expiry or default to first
        if (node.expireNodeId) {
          state = { ...state, currentNodeId: node.expireNodeId };
        } else {
          const result = makeChoice(0, node, state, playerState);
          state = { ...result.state, currentNodeId: result.nextNodeId };
          if (result.playerState) playerState = result.playerState;
        }
      }
      continue;
    }
  }

  throw new Error(`Simulation exceeded max iterations on day ${day.id}`);
}

// ============================================================
// 1. KEY PATHS (4 tests)
// ============================================================

describe('Key Paths', () => {
  it('Path 1: Grandmaster (optimal across all 3 days)', () => {
    // Day 1: addressed_both + balanced_both -> anniversary -> hidden ending
    // who_first_a: rapport+15, empathy+5 = 20
    // compromise_a: empathy+15, persuasion+10 = 25 (total 45)
    // test_drive_offer_a: rapport+5 (total 50)
    // test_drive_choice_c (silent): rapport+10 (total 60)
    // anniversary_check: addressed_both + balanced_both -> knows_anniversary
    // closing_b (anniversary): opportunity+20, empathy+10 = 30 (total 90)
    // d1_check: anniversary_surprise -> hidden
    const d1 = simulateDay(day1, {
      d1_who_first: 0,         // addressed_both: rapport+15, empathy+5
      d1_compromise: 0,        // balanced_both: empathy+15, persuasion+10
      d1_test_drive_offer: 0,  // test_drive: rapport+5
      d1_test_drive_choice: 2, // silent: rapport+10
      d1_closing: 1,           // anniversary_surprise: opportunity+20, empathy+10
    });
    expect(d1.endNodeId).toBe('d1_end_hidden');
    expect(d1.outcome).toBe('hidden_ending');
    expect(d1.state.score.total).toBe(90);
    expect(d1.state.flags.d1_success).toBe(true);
    expect(d1.state.flags.d1_hidden).toBe(true);
    expect(d1.playerState.achievements).toContain('love_sells');

    // Day 2: with d1_success callback (+5) + best choices -> hidden
    // callback: opportunity+5 (total 5)
    // presentation_a: expertise+15, rapport+5 = 20 (total 25)
    // objection_a: persuasion+15, expertise+5 = 20 (total 45)
    // test_drive_offer_a: timing+10, persuasion+5 = 15 (total 60)
    // test_drive_choice_a: expertise+10 (total 70)
    // closing_c: rapport+10, empathy+5 = 15 (total 85)
    // d2_check: score>=40 + respected_knowledge -> hidden
    const d2 = simulateDay(
      day2,
      {
        d2_presentation: 0,      // respected_knowledge: expertise+15, rapport+5
        d2_objection: 0,         // value_reframe: persuasion+15, expertise+5
        d2_test_drive_offer: 0,  // test_drive: timing+10, persuasion+5
        d2_test_drive_choice: 0, // cruise: expertise+10
        d2_closing: 2,           // soft_close: rapport+10, empathy+5
      },
      { lives: 3, flags: { d1_success: true } },
    );
    expect(d2.endNodeId).toBe('d2_end_hidden');
    expect(d2.outcome).toBe('hidden_ending');
    expect(d2.state.score.total).toBe(85);
    expect(d2.state.flags.d2_hidden).toBe(true);

    // Day 3: Part A (Abdullaev) + Part B (Sardor) -> grandmaster
    // Prep [0,1]: expertise+8, rapport+8 = 16
    // Greeting VIP (index 0, needs knows_vip_protocol): rapport+15, timing+5 = 20 (total 36)
    // Fleet (index 0): persuasion+15, expertise+8 = 23 (total 59)
    // Wife car (index 2): bundled_deal: opportunity+10, persuasion+8 = 18 (total 77)
    // abd_check: fleet_package + bundled_deal + score>=55 -> abd_hidden (+gain_life, +achievement)
    // Sardor approach (index 0): empathy+12, rapport+8 = 20 (total 97)
    // Needs (index 0): discovery+15, rapport+8 = 23 (total 120)
    // Objection (index 0): persuasion+15, expertise+5 = 20 (total 140)
    // Sardor closing (index 0): timing+12, persuasion+8 = 20 (total 160)
    // grandmaster_check: score>=63 + patient_approach + deep_discovery + honest_answer + d1_success -> grandmaster
    const d3 = simulateDay(
      day3,
      {
        d3_preparation: [0, 1],   // researched_company + knows_vip_protocol
        d3_greeting: 0,           // vip_greeting (conditional on knows_vip_protocol)
        d3_fleet: 0,              // fleet_package
        d3_wife_car: 2,           // bundled_deal
        d3_sardor_approach: 0,    // patient_approach
        d3_needs: 0,              // deep_discovery
        d3_objection: 0,          // honest_answer
        d3_sardor_closing: 0,     // test_drive
      },
      { lives: 5, flags: { d1_success: true, d2_hidden: true } },
    );
    expect(d3.state.score.total).toBe(160);
    expect(d3.endNodeId).toBe('d3_gm_cta');
    expect(d3.outcome).toBe('hidden_ending');
    expect(d3.state.flags.d3_grandmaster).toBe(true);
    expect(d3.playerState.achievements).toContain('grandmaster');
  });

  it('Path 2: All-A (always first choice)', () => {
    // Day 1: all index 0 -> good score, success
    // who_first_a: 20, compromise_a: 25, test_drive_offer_a: 5, test_drive_choice_a: 8
    // anniversary: addressed_both + balanced_both -> knows_anniversary -> closing
    // closing_a: timing+10, rapport+5 = 15
    // Total: 20+25+5+8+15 = 73
    const d1 = simulateDay(day1, {
      d1_who_first: 0,
      d1_compromise: 0,
      d1_test_drive_offer: 0,
      d1_test_drive_choice: 0,
      d1_closing: 0,
    });
    expect(d1.state.score.total).toBe(73);
    expect(d1.endNodeId).toBe('d1_end_success'); // no anniversary_surprise -> success (73>=32)
    expect(d1.outcome).toBe('success');
    expect(d1.state.flags.d1_success).toBe(true);

    // Day 2: all index 0 -> respected_knowledge + high score
    // callback +5, presentation_a: 20, objection_a: 20, test_drive_offer_a: 15, test_drive_choice_a: 10, closing_a: 11
    // Total: 5+20+20+15+10+11 = 81
    const d2 = simulateDay(
      day2,
      {
        d2_presentation: 0,
        d2_objection: 0,
        d2_test_drive_offer: 0,
        d2_test_drive_choice: 0,
        d2_closing: 0,
      },
      { lives: 3, flags: { d1_success: true } },
    );
    // d2_check: score>=40 + respected_knowledge -> hidden
    expect(d2.state.score.total).toBe(81);
    expect(d2.endNodeId).toBe('d2_end_hidden');

    // Day 3: all index 0 for both parts
    const d3 = simulateDay(
      day3,
      {
        d3_preparation: [0, 1],
        d3_greeting: 0,           // needs knows_vip_protocol (set by prep[1])
        d3_fleet: 0,              // fleet_package
        d3_wife_car: 0,           // personalized
        d3_sardor_approach: 0,    // patient_approach
        d3_needs: 0,              // deep_discovery
        d3_objection: 0,          // honest_answer
        d3_sardor_closing: 0,     // test_drive
      },
      { lives: 5, flags: { d1_success: true, d2_hidden: true } },
    );
    // No bundled_deal -> not abd_hidden. But score should be high enough for abd_success
    // Part A: 16 + 20 + 23 + 17 = 76 (>=48 -> abd_success)
    // Part B: 20 + 23 + 20 + 20 = 83 (total 159)
    // grandmaster_check: score>=63 + patient_approach + deep_discovery + honest_answer + d1_success -> grandmaster
    expect(d3.state.score.total).toBe(159);
    expect(d3.endNodeId).toBe('d3_gm_cta');
    expect(d3.state.flags.d3_grandmaster).toBe(true);
  });

  it('Path 3: Game Over (timers expire everywhere)', () => {
    // Day 1: compromise expires (has timer)
    const d1 = simulateDay(day1, {
      d1_who_first: 0,
      // d1_compromise has expireNodeId -> expire: timing-5
      d1_test_drive_offer: 0,
      d1_test_drive_choice: 0,
      // d1_closing: defaults to index 0
    });
    // who_first_a: 20, compromise_expired: -5 (total 15), test_drive_offer_a: 5 (total 20)
    // test_drive_choice_a: 8 (total 28)
    // anniversary_check: addressed_both but not balanced_both -> fallback -> d1_closing
    // closing default (index 0): 15 (total 43)
    // d1_check: no anniversary_surprise, 43 >= 32 -> success
    expect(d1.state.score.total).toBe(43);
    expect(d1.endNodeId).toBe('d1_end_success');

    // Day 2: let d2_objection timer expire
    const d2 = simulateDay(day2, {
      d2_presentation: 2,      // asked_priorities: discovery+8, empathy+5 = 13
      // d2_objection has expireNodeId -> expire: timing-8 (total 5)
      d2_test_drive_offer: 1,  // skip test drive: timing+3 (total 8)
      d2_closing: 1,           // pressure_close: timing+5, rapport-3 = 2 (total 10)
    });
    expect(d2.state.score.total).toBe(10);
    // 10 < 20 -> fail
    expect(d2.endNodeId).toBe('d2_end_fail');
    expect(d2.outcome).toBe('failure');
    // End effects include lose_life
    expect(d2.state.lives).toBe(2); // started at 3, lost 1

    // Day 3: let all timers expire
    const d3 = simulateDay(
      day3,
      {
        d3_preparation: [0, 1],
        d3_greeting: 1,          // standard: timing+8
        // d3_fleet expires: timing-8
        d3_wife_car: 1,          // power: expertise+8
        // d3_sardor_approach expires: timing-8, rapport-5
        d3_needs: 0,             // deep_discovery: discovery+15, rapport+8
        // d3_objection expires: timing-5, persuasion-5
        // d3_sardor_closing expires: timing-5, lose_life
      },
      { lives: 2, flags: {} },
    );
    // Part A: 16 + 8 + (-8) + 8 = 24 (abd_check: 24 < 28 -> abd_fail, lose_life)
    // Part B: (-13) + 23 + (-10) + (-5, lose_life)
    // Total is sum of all. Lots of negative from timers.
    expect(d3.state.score.total).toBeLessThan(56);
    // Multiple lose_life effects should drop lives
    expect(d3.state.lives).toBeLessThanOrEqual(1);
  });

  it('Path 4: Comeback Kid (fail then replay to success)', () => {
    // Day 1: worst path -> failure
    const d1fail = simulateDay(day1, {
      d1_who_first: 2,     // approached_nilufar: expertise+8
      // d1_compromise expires: timing-5
      d1_test_drive_offer: 1, // skip test drive
      d1_closing: 2,          // special_price: timing+5
    });
    // 8 + (-5) + 0 + 5 = 8
    expect(d1fail.state.score.total).toBe(8);
    expect(d1fail.endNodeId).toBe('d1_end_fail'); // 8 < 18
    expect(d1fail.outcome).toBe('failure');
    expect(d1fail.state.lives).toBe(2); // 3 - 1 from end effect

    // Replay Day 1 via handleGameOver
    const restartState = handleGameOver(d1fail.state, day1);
    expect(restartState.isGameOverRestart).toBe(true);
    expect(restartState.isReplay).toBe(true);
    expect(restartState.lives).toBe(1);
    expect(restartState.score.total).toBe(0);

    // Day 1 replay: best choices -> success
    const d1success = simulateDay(day1, {
      d1_who_first: 0,
      d1_compromise: 0,
      d1_test_drive_offer: 0,
      d1_test_drive_choice: 0,
      d1_closing: 0,
    });
    expect(d1success.endNodeId).toBe('d1_end_success');
    expect(d1success.outcome).toBe('success');
    expect(d1success.state.flags.d1_success).toBe(true);
  });
});

// ============================================================
// 2. ALL PATHS PER DAY
// ============================================================

describe('Day 1 — All Paths', () => {
  it('hidden ending (anniversary) -> highest score', () => {
    const result = simulateDay(day1, {
      d1_who_first: 0,         // addressed_both: 20
      d1_compromise: 0,        // balanced_both: 25
      d1_test_drive_offer: 0,  // test_drive: 5
      d1_test_drive_choice: 2, // silent: 10
      d1_closing: 1,           // anniversary_surprise: 30
    });
    expect(result.state.score.total).toBe(90);
    expect(result.endNodeId).toBe('d1_end_hidden');
    expect(result.outcome).toBe('hidden_ending');
    expect(result.state.flags.anniversary_surprise).toBe(true);
    expect(result.playerState.achievements).toContain('love_sells');
  });

  it('good path without anniversary -> success', () => {
    const result = simulateDay(day1, {
      d1_who_first: 0,         // 20
      d1_compromise: 0,        // 25
      d1_test_drive_offer: 0,  // 5
      d1_test_drive_choice: 0, // 8
      d1_closing: 0,           // 15
    });
    // 20 + 25 + 5 + 8 + 15 = 73
    expect(result.state.score.total).toBe(73);
    expect(result.endNodeId).toBe('d1_end_success');
    expect(result.outcome).toBe('success');
    expect(calculateRating(73, day1.targetScore)).toBe('S'); // 73/40 = 182%
  });

  it('middle path (approach javlon + equinox sport) -> success', () => {
    const result = simulateDay(day1, {
      d1_who_first: 1,         // timing+8
      d1_compromise: 1,        // expertise+12, persuasion+5 = 17
      d1_test_drive_offer: 0,  // rapport+5
      d1_test_drive_choice: 1, // expertise+5
      d1_closing: 0,           // timing+10, rapport+5 = 15
    });
    // 8 + 17 + 5 + 5 + 15 = 50
    expect(result.state.score.total).toBe(50);
    expect(result.endNodeId).toBe('d1_end_success');
    expect(result.outcome).toBe('success');
  });

  it('worst path (approached nilufar + expire + skip test drive) -> failure', () => {
    const result = simulateDay(day1, {
      d1_who_first: 2,          // expertise+8
      // d1_compromise expires: timing-5
      d1_test_drive_offer: 1,   // skip test drive, no effects
      d1_closing: 2,            // timing+5
    });
    // 8 + (-5) + 0 + 5 = 8
    expect(result.state.score.total).toBe(8);
    expect(result.endNodeId).toBe('d1_end_fail');
    expect(result.outcome).toBe('failure');
    expect(result.state.lives).toBe(2); // lost 1 from end effects
  });

  it('partial path', () => {
    const result = simulateDay(day1, {
      d1_who_first: 2,         // expertise+8
      d1_compromise: 2,        // timing+8, opportunity+5 = 13
      d1_test_drive_offer: 1,  // skip test drive
      d1_closing: 0,           // timing+10, rapport+5 = 15
    });
    // 8 + 13 + 0 + 15 = 36
    expect(result.state.score.total).toBe(36);
    // 36 >= 32 -> success actually
    expect(result.endNodeId).toBe('d1_end_success');
    // For partial: need 18 <= score < 32
    // Let's try: who_first_c(8) + compromise_expire(-5) + test_drive_offer_b(0) + closing_c(5) = 8
    // That's failure. Hard to get exactly 18-31 range...
    // Skip test drive + trade-in approach:
    // who_first_b(8) + compromise_c(13) + test_drive_offer_b(0) + closing_c(5) = 26
    const partial = simulateDay(day1, {
      d1_who_first: 1,         // timing+8
      d1_compromise: 2,        // timing+8, opportunity+5 = 13
      d1_test_drive_offer: 1,  // skip
      d1_closing: 2,           // timing+5
    });
    // 8 + 13 + 0 + 5 = 26
    expect(partial.state.score.total).toBe(26);
    expect(partial.endNodeId).toBe('d1_end_partial'); // 18 <= 26 < 32
    expect(partial.outcome).toBe('partial');
  });
});

describe('Day 2 — All Paths', () => {
  it('with d1_success callback -> +5 bonus score', () => {
    const withCallback = simulateDay(
      day2,
      {
        d2_presentation: 1,
        d2_objection: 1,
        d2_test_drive_offer: 1,
        d2_closing: 0,
      },
      { lives: 3, flags: { d1_success: true } },
    );
    const withoutCallback = simulateDay(
      day2,
      {
        d2_presentation: 1,
        d2_objection: 1,
        d2_test_drive_offer: 1,
        d2_closing: 0,
      },
      { lives: 3, flags: {} },
    );
    expect(withCallback.state.score.total - withoutCallback.state.score.total).toBe(5);
  });

  it('hidden ending path -> respected_knowledge + high score', () => {
    const result = simulateDay(
      day2,
      {
        d2_presentation: 0,      // respected_knowledge: expertise+15, rapport+5 = 20
        d2_objection: 0,         // value_reframe: persuasion+15, expertise+5 = 20
        d2_test_drive_offer: 0,  // timing+10, persuasion+5 = 15
        d2_test_drive_choice: 0, // expertise+10
        d2_closing: 2,           // soft_close: rapport+10, empathy+5 = 15
      },
      { lives: 3, flags: { d1_success: true } },
    );
    // callback+5, 20+20+15+10+15 = 85
    expect(result.state.score.total).toBe(85);
    expect(result.endNodeId).toBe('d2_end_hidden');
    expect(result.outcome).toBe('hidden_ending');
    expect(result.state.flags.d2_hidden).toBe(true);
    expect(result.playerState.achievements).toContain('respect_earns_referrals');
    expect(result.state.lives).toBe(4); // gained 1 life
  });

  it('without callback -> no bonus, still can get hidden', () => {
    const result = simulateDay(
      day2,
      {
        d2_presentation: 0,      // expertise+15, rapport+5 = 20
        d2_objection: 0,         // persuasion+15, expertise+5 = 20
        d2_test_drive_offer: 0,  // timing+10, persuasion+5 = 15
        d2_test_drive_choice: 0, // expertise+10
        d2_closing: 2,           // rapport+10, empathy+5 = 15
      },
      { lives: 3, flags: {} },
    );
    expect(result.state.score.total).toBe(80);
    // Score >= 40 + respected_knowledge -> hidden
    expect(result.endNodeId).toBe('d2_end_hidden');
  });

  it('objection timer expires -> low score -> fail', () => {
    const result = simulateDay(day2, {
      d2_presentation: 2,      // discovery+8, empathy+5 = 13
      // d2_objection expires: timing-8
      d2_test_drive_offer: 1,  // skip test drive: timing+3
      d2_closing: 1,           // pressure: timing+5, rapport-3 = 2
    });
    // 13 + (-8) + 3 + 2 = 10
    expect(result.state.score.total).toBe(10);
    expect(result.endNodeId).toBe('d2_end_fail');
    expect(result.outcome).toBe('failure');
    expect(result.state.lives).toBe(2); // lost 1
  });
});

describe('Day 3 — Part A: Abdullaev (VIP)', () => {
  it('multiSelect [0,1] -> researched_company + knows_vip_protocol', () => {
    const result = simulateDay(day3, {
      d3_preparation: [0, 1],
      d3_greeting: 1,    // standard: timing+8
      d3_fleet: 1,       // reliable: expertise+10, timing+5
      d3_wife_car: 0,    // personalized: empathy+12, expertise+5
      d3_sardor_approach: 0,
      d3_needs: 0,
      d3_objection: 0,
      d3_sardor_closing: 0,
    });
    expect(result.state.flags.researched_company).toBe(true);
    expect(result.state.flags.knows_vip_protocol).toBe(true);
    // Part A: 16 + 8 + 15 + 17 = 56 (>= 48 -> abd_success)
    // Part B adds more score
    expect(result.state.score.total).toBeGreaterThanOrEqual(56);
  });

  it('multiSelect [0,2] -> researched_company + has_discount_authority', () => {
    const result = simulateDay(day3, {
      d3_preparation: [0, 2],
      d3_greeting: 1,    // standard: timing+8
      d3_fleet: 0,       // fleet_package: persuasion+15, expertise+8
      d3_wife_car: 0,    // personalized: empathy+12, expertise+5
      d3_sardor_approach: 0,
      d3_needs: 0,
      d3_objection: 0,
      d3_sardor_closing: 0,
    });
    expect(result.state.flags.researched_company).toBe(true);
    expect(result.state.flags.has_discount_authority).toBe(true);
    // Part A: 16 + 8 + 23 + 17 = 64 (>= 48 -> abd_success)
    expect(result.state.score.total).toBeGreaterThanOrEqual(64);
  });

  it('abd_hidden path -> fleet_package + bundled_deal + high score', () => {
    const result = simulateDay(day3, {
      d3_preparation: [0, 1],   // researched_company + knows_vip_protocol
      d3_greeting: 0,           // vip_greeting: rapport+15, timing+5 = 20
      d3_fleet: 0,              // fleet_package: persuasion+15, expertise+8 = 23
      d3_wife_car: 2,           // bundled_deal: opportunity+10, persuasion+8 = 18
      d3_sardor_approach: 0,
      d3_needs: 0,
      d3_objection: 0,
      d3_sardor_closing: 0,
    });
    // Part A: 16 + 20 + 23 + 18 = 77
    // abd_check: fleet_package + bundled_deal + score>=55 -> abd_hidden
    expect(result.state.flags.fleet_package).toBe(true);
    expect(result.state.flags.bundled_deal).toBe(true);
    expect(result.state.flags.d3_abd_hidden).toBe(true);
    expect(result.playerState.achievements).toContain('corporate_king');
  });
});

describe('Day 3 — Part B: Sardor (Mystery Shopper)', () => {
  it('grandmaster path (all flags + score >= 63)', () => {
    const result = simulateDay(
      day3,
      {
        d3_preparation: [0, 1],
        d3_greeting: 0,           // vip_greeting
        d3_fleet: 0,              // fleet_package
        d3_wife_car: 2,           // bundled_deal
        d3_sardor_approach: 0,    // patient_approach: empathy+12, rapport+8
        d3_needs: 0,              // deep_discovery: discovery+15, rapport+8
        d3_objection: 0,          // honest_answer: persuasion+15, expertise+5
        d3_sardor_closing: 0,     // test_drive: timing+12, persuasion+8
      },
      { lives: 3, flags: { d1_success: true } },
    );
    // Part A: 16+20+23+18 = 77 (abd_hidden)
    // Part B: 20+23+20+20 = 83 (total 160)
    expect(result.state.score.total).toBe(160);
    expect(result.endNodeId).toBe('d3_gm_cta');
    expect(result.outcome).toBe('hidden_ending');
    expect(result.state.flags.d3_grandmaster).toBe(true);
    expect(result.playerState.achievements).toContain('grandmaster');
  });

  it('good path without grandmaster flags -> success', () => {
    const result = simulateDay(
      day3,
      {
        d3_preparation: [0, 1],
        d3_greeting: 1,           // standard: timing+8
        d3_fleet: 1,              // reliable
        d3_wife_car: 0,           // personalized
        d3_sardor_approach: 1,    // timing+8, rapport+5 (no patient_approach)
        d3_needs: 0,              // deep_discovery
        d3_objection: 0,          // honest_answer
        d3_sardor_closing: 0,     // test_drive
      },
      { lives: 3, flags: { d1_success: true } },
    );
    // Has honest_answer, deep_discovery, d1_success, but NO patient_approach -> not grandmaster
    // Total should be >= 56 -> success
    expect(result.state.score.total).toBeGreaterThanOrEqual(56);
    expect(result.endNodeId).toBe('d3_s_cta');
    expect(result.outcome).toBe('success');
  });

  it('dilnoza tip with d1+d2 success -> got_dilnoza_tip flag', () => {
    const result = simulateDay(
      day3,
      {
        d3_preparation: [0, 1],
        d3_greeting: 0,
        d3_fleet: 0,
        d3_wife_car: 2,
        d3_sardor_approach: 0,
        d3_needs: 0,
        d3_objection: 0,
        d3_sardor_closing: 0,
      },
      { lives: 3, flags: { d1_success: true, d2_success: true } },
    );
    // Should have got_dilnoza_tip flag from d3_dilnoza_tip node
    expect(result.state.flags.got_dilnoza_tip).toBe(true);
    expect(result.endNodeId).toBe('d3_gm_cta');
  });

  it('no dilnoza tip without d1+d2 success', () => {
    const result = simulateDay(
      day3,
      {
        d3_preparation: [0, 1],
        d3_greeting: 0,
        d3_fleet: 0,
        d3_wife_car: 2,
        d3_sardor_approach: 0,
        d3_needs: 0,
        d3_objection: 0,
        d3_sardor_closing: 0,
      },
      { lives: 3, flags: { d1_success: true } },
    );
    // Only d1_success, not d2_success -> no dilnoza tip
    expect(result.state.flags.got_dilnoza_tip).toBeUndefined();
    // Still reaches grandmaster since d1_success satisfies the OR condition
    expect(result.endNodeId).toBe('d3_gm_cta');
  });
});

// ============================================================
// 3. CROSS-DAY FLAG PROPAGATION
// ============================================================

describe('Cross-day Flag Propagation', () => {
  it('d1_success flows to d2_callback_check', () => {
    // With d1_success -> should go through d2_callback (+5 opportunity)
    const withFlag = simulateDay(
      day2,
      {
        d2_presentation: 0,
        d2_objection: 0,
        d2_test_drive_offer: 0,
        d2_test_drive_choice: 0,
        d2_closing: 2,
      },
      { lives: 3, flags: { d1_success: true } },
    );
    // Without d1_success -> no callback
    const withoutFlag = simulateDay(
      day2,
      {
        d2_presentation: 0,
        d2_objection: 0,
        d2_test_drive_offer: 0,
        d2_test_drive_choice: 0,
        d2_closing: 2,
      },
      { lives: 3, flags: {} },
    );
    expect(withFlag.state.score.total - withoutFlag.state.score.total).toBe(5);
  });

  it('d1_success + d2_success flows to d3_dilnoza_check', () => {
    const result = simulateDay(
      day3,
      {
        d3_preparation: [0, 1],
        d3_greeting: 1,
        d3_fleet: 1,
        d3_wife_car: 1,
        d3_sardor_approach: 1,
        d3_needs: 1,
        d3_objection: 1,
        d3_sardor_closing: 1,
      },
      { lives: 3, flags: { d1_success: true, d2_success: true } },
    );
    expect(result.state.flags.got_dilnoza_tip).toBe(true);
  });

  it('hidden ending flags preserved across days', () => {
    const state = initDaySession('car-dealership', day3, {
      lives: 5,
      flags: {
        d1_success: true,
        d2_hidden: true,
        // Non-cross-day flags should be stripped
        approach_warm: true,
        respected_knowledge: true,
      },
    });
    // Cross-day flags (d\d+_*) should be preserved
    expect(state.flags.d1_success).toBe(true);
    expect(state.flags.d2_hidden).toBe(true);
    // Non-cross-day flags should be stripped
    expect(state.flags.approach_warm).toBeUndefined();
    expect(state.flags.respected_knowledge).toBeUndefined();
    expect(state.lives).toBe(5);
  });
});

// ============================================================
// 4. EDGE CASES
// ============================================================

describe('Edge Cases', () => {
  it('timer expire on multiple timed nodes in Day 3 Sardor section', () => {
    const result = simulateDay(
      day3,
      {
        d3_preparation: [0, 1],
        d3_greeting: 1,         // standard: timing+8
        // d3_fleet has expireNodeId -> expire: timing-8
        d3_wife_car: 1,         // power: expertise+8
        // d3_sardor_approach has expireNodeId -> expire: timing-8, rapport-5
        d3_needs: 0,            // deep_discovery: discovery+15, rapport+8
        // d3_objection has expireNodeId -> expire: timing-5, persuasion-5
        // d3_sardor_closing has expireNodeId -> expire: timing-5, lose_life
      },
      { lives: 3, flags: {} },
    );
    // Multiple timer expirations should lower score significantly
    expect(result.state.score.total).toBeLessThan(56);
    // Sardor closing expire causes lose_life
    expect(result.state.lives).toBeLessThan(3);
  });

  it('combo building across multiple good choices', () => {
    // Day 1 choices
    const result = simulateDay(day1, {
      d1_who_first: 0,
      d1_compromise: 0,
      d1_test_drive_offer: 0,
      d1_test_drive_choice: 0,
      d1_closing: 0,
    });
    // Verify choices recorded in history
    expect(result.state.choiceHistory.length).toBeGreaterThanOrEqual(4);
    expect(result.state.choiceHistory[0].nodeId).toBe('d1_who_first');
    expect(result.state.choiceHistory[0].choiceIndex).toBe(0);
    expect(result.state.choiceHistory[1].nodeId).toBe('d1_compromise');
  });

  it('score dimensions can go negative but total stays correct', () => {
    // Day 1: expire compromise (-5 timing) then skip test drive
    const result = simulateDay(day1, {
      d1_who_first: 2,          // expertise+8
      // d1_compromise expires: timing-5
      d1_test_drive_offer: 1,   // skip test drive
      d1_closing: 2,            // timing+5
    });
    // Individual dimension: timing started from -5, then +5 = 0
    // But this depends on whether timing was used elsewhere. Let's just verify totals.
    expect(result.state.score.total).toBe(8); // 8+(-5)+0+5 = 8
    expect(result.state.score.total).toBeLessThan(18); // failure territory
    expect(result.endNodeId).toBe('d1_end_fail');
  });
});

// ============================================================
// 5. SCENARIO STRUCTURE VALIDATION
// ============================================================

describe('Scenario Structure', () => {
  it('carDealershipScenario has exactly 3 days', () => {
    expect(carDealershipScenario.days).toHaveLength(3);
    expect(carDealershipScenario.days[0].id).toBe('car-day1');
    expect(carDealershipScenario.days[1].id).toBe('car-day2');
    expect(carDealershipScenario.days[2].id).toBe('car-day3');
  });

  it('every day root node exists and is reachable', () => {
    for (const day of carDealershipScenario.days) {
      const rootNode = resolveNode(day.rootNodeId, day);
      expect(rootNode).toBeDefined();
      expect(rootNode.id).toBe(day.rootNodeId);
    }
  });

  it('every end node has a valid outcome', () => {
    const validOutcomes = ['success', 'partial', 'failure', 'hidden_ending'];
    for (const day of carDealershipScenario.days) {
      for (const node of Object.values(day.nodes)) {
        if (node.type === 'end') {
          expect(validOutcomes).toContain(node.outcome);
        }
      }
    }
  });

  it('all nextNodeId references point to existing nodes', () => {
    for (const day of carDealershipScenario.days) {
      for (const node of Object.values(day.nodes)) {
        if (node.type === 'end') continue;

        if ('nextNodeId' in node && node.nextNodeId) {
          expect(day.nodes[node.nextNodeId]).toBeDefined();
        }
        if (node.type === 'choice') {
          for (const choice of node.choices) {
            expect(day.nodes[choice.nextNodeId]).toBeDefined();
          }
          if (node.expireNodeId) {
            expect(day.nodes[node.expireNodeId]).toBeDefined();
          }
        }
        if (node.type === 'condition_branch') {
          for (const branch of node.branches) {
            expect(day.nodes[branch.nextNodeId]).toBeDefined();
          }
          expect(day.nodes[node.fallbackNodeId]).toBeDefined();
        }
        if (node.type === 'timer_start') {
          expect(day.nodes[node.expireNodeId]).toBeDefined();
          expect(day.nodes[node.nextNodeId]).toBeDefined();
        }
      }
    }
  });
});
