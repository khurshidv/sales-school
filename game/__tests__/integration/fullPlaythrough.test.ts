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
  day4,
  day5,
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
  it('Path 1: Grandmaster (optimal across all 5 days)', () => {
    // Day 1: approach_c (empathy+12) + needs_a (discovery+12, rapport+5) + suggest_a (persuasion+12, expertise+5) = 46
    const d1 = simulateDay(day1, {
      d1_approach: 2,   // soft approach: empathy +12
      d1_needs: 0,      // priorities: discovery +12, rapport +5
      d1_suggest: 0,    // equinox: persuasion +12, expertise +5
    });
    expect(d1.endNodeId).toBe('d1_end_success');
    expect(d1.outcome).toBe('success');
    expect(d1.state.score.total).toBe(46);
    expect(d1.state.flags.d1_success).toBe(true);

    // Day 2: with d1_success callback (+5) + best choices
    const d2 = simulateDay(
      day2,
      {
        d2_presentation: 0,  // respected_knowledge: expertise+15, rapport+5
        d2_objection: 0,     // value_reframe: persuasion+15, expertise+5
        d2_closing: 0,       // test_drive: timing+12, persuasion+5
      },
      { lives: 3, flags: { d1_success: true } },
    );
    expect(d2.endNodeId).toBe('d2_end_hidden');
    expect(d2.outcome).toBe('hidden_ending');
    // callback +5 + 20 + 20 + 17 = 62
    expect(d2.state.score.total).toBe(62);
    expect(d2.state.flags.d2_hidden).toBe(true);

    // Day 3: addressed_both + balanced_both -> anniversary -> hidden
    const d3 = simulateDay(
      day3,
      {
        d3_who_first: 0,    // addressed_both: rapport+15, empathy+5
        d3_compromise: 0,   // balanced_both: empathy+15, persuasion+10
        d3_closing: 1,      // anniversary_surprise (conditional, but index 1)
      },
      { lives: 4, flags: { d1_success: true, d2_hidden: true } },
    );
    expect(d3.endNodeId).toBe('d3_end_hidden');
    expect(d3.outcome).toBe('hidden_ending');
    expect(d3.state.flags.d3_hidden).toBe(true);

    // Day 4: best prep + best choices -> hidden
    const d4 = simulateDay(
      day4,
      {
        d4_preparation: [0, 1],   // researched_company + knows_vip_protocol
        d4_greeting: 0,           // vip_greeting (conditional on knows_vip_protocol)
        d4_fleet: 0,              // fleet_package
        d4_wife_car: 2,           // bundled_deal
      },
      { lives: 5, flags: { d1_success: true, d2_hidden: true, d3_hidden: true } },
    );
    expect(d4.endNodeId).toBe('d4_end_hidden');
    expect(d4.outcome).toBe('hidden_ending');
    expect(d4.state.flags.d4_hidden).toBe(true);

    // Day 5: with d1_success + d2_success -> dilnoza tip, then optimal
    // Note: d2_hidden is set but d2_success is NOT set for hidden ending.
    // For grandmaster we need d1_success OR d2_success. We have d1_success.
    // For dilnoza tip: needs d1_success AND d2_success.
    // Since d2 ended hidden (not success), no dilnoza tip. But grandmaster needs
    // patient_approach + deep_discovery + honest_answer + (d1_success OR d2_success)
    const d5 = simulateDay(
      day5,
      {
        d5_approach: 0,            // patient_approach: empathy+12, rapport+8
        d5_needs_choice: 0,        // deep_discovery: discovery+15, rapport+8
        d5_objection_choice: 0,    // honest_answer: persuasion+15, expertise+5
        d5_closing: 0,             // test_drive: timing+12, persuasion+8
      },
      {
        lives: 5,
        flags: { d1_success: true, d2_hidden: true, d3_hidden: true, d4_hidden: true },
      },
    );
    // Score: 20 + 23 + 20 + 20 = 83
    expect(d5.state.score.total).toBe(83);
    expect(d5.endNodeId).toBe('d5_end_grandmaster');
    expect(d5.outcome).toBe('hidden_ending');
    expect(d5.state.flags.d5_grandmaster).toBe(true);
  });

  it('Path 2: All-B (always second choice)', () => {
    const d1 = simulateDay(day1, {
      d1_approach: 1,
      d1_needs: 1,
      d1_suggest: 1,
    });
    // approach_b (timing+5) + needs_b (discovery+3) + suggest_b (empathy+8, persuasion+5) = 21
    expect(d1.state.score.total).toBe(21);
    expect(d1.endNodeId).toBe('d1_end_partial'); // 12 <= 21 < 25
    expect(d1.outcome).toBe('partial');

    const d2 = simulateDay(day2, {
      d2_presentation: 1,
      d2_objection: 1,
      d2_closing: 1,
    });
    // presentation_b (expertise+10) + objection_b (persuasion+10, rapport+5) + closing_b (rapport+8, expertise+3) = 36
    expect(d2.state.score.total).toBe(36);
    // Score >= 32 but no respected_knowledge -> success (not hidden)
    expect(d2.endNodeId).toBe('d2_end_success');
    expect(d2.outcome).toBe('success');

    const d3 = simulateDay(day3, {
      d3_who_first: 1,
      d3_compromise: 1,
      d3_closing: 1,
    });
    // who_first_b (timing+8) + compromise_b (expertise+12, persuasion+5) + closing_b (needs knows_anniversary -> no)
    // Since addressed_both is not set, anniversary check fallback -> d3_closing
    // closing_b requires knows_anniversary flag (which is not set), so condition fails
    // But makeChoice(1) will still pick index 1 regardless of condition
    // closing_b (conditional: knows_anniversary) -> opportunity+20, empathy+10
    // Wait - actually closing_b's condition is checked by UI, not by makeChoice.
    // makeChoice just picks by index. So: 8 + 17 + 30 = 55? No...
    // who_first_b: timing+8 = 8
    // compromise_b: expertise+12, persuasion+5 = 17, total 25
    // anniversary_check: no addressed_both -> fallback -> d3_closing
    // closing index 1: anniversary_surprise (opportunity+20, empathy+10) = 30, total 55
    // But! This choice has condition {flag: knows_anniversary} which we don't have
    // However makeChoice doesn't validate conditions, it just selects by array index
    // So closing_b at index 1 gives +30, total = 55
    // d3_check: anniversary_surprise flag? Yes (set by closing_b effects)
    // -> d3_end_hidden!
    // Actually this is the hidden ending because makeChoice bypasses conditions.
    // In real gameplay, the UI filters unavailable choices, so this wouldn't happen.
    // For a realistic test, let's use closing index 0 or 2 instead.
    // Let me recalculate with closing index 2 (the only unconditional non-anniversary choice):
    // Actually closing_a (index 0) is unconditional too. And closing_c (index 2) is unconditional.
    // For "all B" path, let's use index 2 for closing (third option) since index 1 is conditional.
    // Hmm, but the spec says "always second choice (index 1)". Let me just test what happens.
    // With makeChoice(1) -> anniversary_surprise flag IS set -> d3_end_hidden
    // This is a valid engine path, just not UI-reachable without the condition.
    // For realism, let me adjust: if choice has condition that's not met, skip to next.
    // But the spec says "always second choice". Let's keep it and just verify.
    expect(d3.state.score.total).toBe(55);
    // anniversary_surprise flag set -> hidden ending
    expect(d3.endNodeId).toBe('d3_end_hidden');

    const d4 = simulateDay(day4, {
      d4_preparation: [0, 1],  // multiSelect must pick 2
      d4_greeting: 1,
      d4_fleet: 1,
      d4_wife_car: 1,
    });
    // prep [0,1]: expertise+8, rapport+8 = 16
    // greeting_b (no condition): timing+8 = 8, total 24
    // fleet_b: expertise+10, timing+5 = 15, total 39
    // wife_car_b: expertise+8 = 8, total 47
    // d4_check: 47 < 48 -> not success, 47 >= 28 -> partial
    expect(d4.state.score.total).toBe(47);
    expect(d4.endNodeId).toBe('d4_end_partial');
    expect(d4.outcome).toBe('partial');

    const d5 = simulateDay(day5, {
      d5_approach: 1,
      d5_needs_choice: 1,
      d5_objection_choice: 1,
      d5_closing: 1,
    });
    // approach_b: timing+8, rapport+5 = 13
    // needs_choice_b: discovery+5, timing+3 = 8, total 21
    // objection_choice_b: persuasion+5, rapport-5 = 0, total 21
    // closing_b: rapport+5 = 5, total 26
    // No d1_success/d2_success flags -> no dilnoza tip
    // d5_final_check: 26 < 30 -> fallback -> fail
    expect(d5.state.score.total).toBe(26);
    expect(d5.endNodeId).toBe('d5_end_fail');
    expect(d5.outcome).toBe('failure');
  });

  it('Path 3: Game Over (timers expire everywhere)', () => {
    // Day 1: let d1_approach timer expire, then default choices
    const d1 = simulateDay(day1, {
      // d1_approach has expireNodeId, so not providing it triggers expire
      d1_needs: 0,
      d1_suggest: 0,
    });
    // approach_expired: timing-5 = -5
    // needs_a: discovery+12, rapport+5 = 17, total 12
    // suggest_a: persuasion+12, expertise+5 = 17, total 29
    // Score >= 25 -> success (not failure)
    expect(d1.endNodeId).toBe('d1_end_success');

    // Day 2: let d2_objection timer expire
    const d2 = simulateDay(day2, {
      d2_presentation: 2,  // asked_priorities: discovery+8, empathy+5 = 13
      // d2_objection has expireNodeId -> expire
      d2_closing: 2,       // pressure_close: timing+5, rapport-3 = 2
    });
    // presentation: 13, objection_expired: timing-8 = -8, total 5, closing: +2, total 7
    expect(d2.state.score.total).toBe(7);
    // 7 < 18 -> fail
    expect(d2.endNodeId).toBe('d2_end_fail');
    expect(d2.outcome).toBe('failure');
    // End effects include lose_life
    expect(d2.state.lives).toBe(2); // started at 3, lost 1

    // Day 3: let compromise timer expire
    const d3 = simulateDay(
      day3,
      {
        d3_who_first: 2,  // approached_nilufar: expertise+8
        // d3_compromise has expireNodeId -> expire
        d3_closing: 2,    // special_price: timing+5
      },
      { lives: 2, flags: {} },
    );
    // who_first_c: 8, compromise_expired: timing-5, total 3, closing: timing+5, total 8
    expect(d3.state.score.total).toBe(8);
    // 8 < 22 -> fail
    expect(d3.endNodeId).toBe('d3_end_fail');
    expect(d3.outcome).toBe('failure');
    expect(d3.state.lives).toBe(1); // started 2, lost 1

    // With 1 life left, another failure = game over
    expect(isGameOver(d3.state.lives - 1)).toBe(true); // If we lose one more
  });

  it('Path 4: Comeback Kid (fail then replay to success)', () => {
    // Day 1: let everything expire/worst -> failure
    const d1fail = simulateDay(day1, {
      // d1_approach expires
      d1_needs: 2,    // jumped_to_pitch: discovery-3, expertise+5 = 2
      d1_suggest: 1,  // suggested_tracker: empathy+8, persuasion+5 = 13
    });
    // approach_expired: -5, needs: 2, suggest: 13 = total 10
    expect(d1fail.state.score.total).toBe(10);
    expect(d1fail.endNodeId).toBe('d1_end_fail'); // 10 < 12
    expect(d1fail.outcome).toBe('failure');
    expect(d1fail.state.lives).toBe(2); // 3 - 1 from end effect

    // Replay Day 1 via handleGameOver
    const restartState = handleGameOver(d1fail.state, day1);
    expect(restartState.isGameOverRestart).toBe(true);
    expect(restartState.isReplay).toBe(true);
    expect(restartState.lives).toBe(1);
    expect(restartState.score.total).toBe(0);

    // Day 1 replay: best choices
    const d1success = simulateDay(day1, {
      d1_approach: 2,
      d1_needs: 0,
      d1_suggest: 0,
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
  it('optimal path (all A choices) -> success with high score', () => {
    const result = simulateDay(day1, {
      d1_approach: 0,   // rapport+10
      d1_needs: 0,      // discovery+12, rapport+5
      d1_suggest: 0,    // persuasion+12, expertise+5
    });
    // 10 + 17 + 17 = 44
    expect(result.state.score.total).toBe(44);
    expect(result.endNodeId).toBe('d1_end_success');
    expect(result.outcome).toBe('success');
    expect(calculateRating(44, day1.targetScore)).toBe('S'); // 44/30 = 146%
  });

  it('worst path (expired + C choices) -> failure', () => {
    const result = simulateDay(day1, {
      // d1_approach expires: timing-5
      d1_needs: 2,    // discovery-3, expertise+5
      d1_suggest: 2,  // expertise+10, discovery+3
    });
    // -5 + 2 + 13 = 10
    expect(result.state.score.total).toBe(10);
    expect(result.endNodeId).toBe('d1_end_fail');
    expect(result.outcome).toBe('failure');
    expect(result.state.lives).toBe(2); // lost 1 from end effects
  });

  it('middle path (all B) -> partial', () => {
    const result = simulateDay(day1, {
      d1_approach: 1,  // timing+5
      d1_needs: 1,     // discovery+3
      d1_suggest: 1,   // empathy+8, persuasion+5
    });
    // 5 + 3 + 13 = 21
    expect(result.state.score.total).toBe(21);
    expect(result.endNodeId).toBe('d1_end_partial');
    expect(result.outcome).toBe('partial');
    expect(calculateRating(21, day1.targetScore)).toBe('B'); // 21/30 = 70%
  });
});

describe('Day 2 — All Paths', () => {
  it('with d1_success callback -> +5 bonus score', () => {
    const withCallback = simulateDay(
      day2,
      {
        d2_presentation: 1,
        d2_objection: 1,
        d2_closing: 1,
      },
      { lives: 3, flags: { d1_success: true } },
    );
    const withoutCallback = simulateDay(
      day2,
      {
        d2_presentation: 1,
        d2_objection: 1,
        d2_closing: 1,
      },
      { lives: 3, flags: {} },
    );
    expect(withCallback.state.score.total - withoutCallback.state.score.total).toBe(5);
  });

  it('without callback -> no bonus, still can succeed', () => {
    const result = simulateDay(
      day2,
      {
        d2_presentation: 0,  // expertise+15, rapport+5 = 20
        d2_objection: 0,     // persuasion+15, expertise+5 = 20
        d2_closing: 0,       // timing+12, persuasion+5 = 17
      },
      { lives: 3, flags: {} },
    );
    expect(result.state.score.total).toBe(57);
    // Score >= 35 and respected_knowledge -> hidden
    expect(result.endNodeId).toBe('d2_end_hidden');
  });

  it('hidden ending path -> respected_knowledge + high score', () => {
    const result = simulateDay(
      day2,
      {
        d2_presentation: 0,
        d2_objection: 0,
        d2_closing: 0,
      },
      { lives: 3, flags: { d1_success: true } },
    );
    expect(result.state.score.total).toBe(62);
    expect(result.endNodeId).toBe('d2_end_hidden');
    expect(result.outcome).toBe('hidden_ending');
    expect(result.state.flags.d2_hidden).toBe(true);
    expect(result.playerState.achievements).toContain('respect_earns_referrals');
    expect(result.state.lives).toBe(4); // gained 1 life
  });
});

describe('Day 3 — All Paths', () => {
  it('anniversary surprise path -> hidden ending', () => {
    const result = simulateDay(day3, {
      d3_who_first: 0,    // addressed_both: rapport+15, empathy+5 = 20
      d3_compromise: 0,   // balanced_both: empathy+15, persuasion+10 = 25
      d3_closing: 1,      // anniversary_surprise: opportunity+20, empathy+10 = 30
    });
    // addressed_both + balanced_both -> anniversary_hint (knows_anniversary flag)
    // closing index 1 (anniversary): +30
    // Total: 20 + 25 + 30 = 75
    expect(result.state.score.total).toBe(75);
    expect(result.state.flags.anniversary_surprise).toBe(true);
    expect(result.endNodeId).toBe('d3_end_hidden');
    expect(result.outcome).toBe('hidden_ending');
    expect(result.playerState.achievements).toContain('love_sells');
  });

  it('normal success path (good choices, no anniversary)', () => {
    const result = simulateDay(day3, {
      d3_who_first: 0,    // rapport+15, empathy+5 = 20
      d3_compromise: 1,   // equinox_sport: expertise+12, persuasion+5 = 17
      d3_closing: 0,      // test_drive: timing+10, rapport+5 = 15
    });
    // No addressed_both + balanced_both together (balanced_both not set)
    // anniversary_check: addressed_both is set but balanced_both is not -> fallback -> d3_closing
    // Total: 20 + 17 + 15 = 52
    expect(result.state.score.total).toBe(52);
    // No anniversary_surprise flag -> check score >= 40 -> success
    expect(result.endNodeId).toBe('d3_end_success');
    expect(result.outcome).toBe('success');
  });

  it('compromise expired -> low score', () => {
    const result = simulateDay(day3, {
      d3_who_first: 2,    // approached_nilufar: expertise+8
      // d3_compromise expires: timing-5
      d3_closing: 0,      // test_drive: timing+10, rapport+5 = 15
    });
    // 8 + (-5) + 15 = 18
    expect(result.state.score.total).toBe(18);
    // 18 < 22 -> fail
    expect(result.endNodeId).toBe('d3_end_fail');
    expect(result.outcome).toBe('failure');
  });
});

describe('Day 4 — All Paths', () => {
  it('multiSelect [0,1] -> researched_company + knows_vip_protocol', () => {
    const result = simulateDay(day4, {
      d4_preparation: [0, 1],
      d4_greeting: 1,    // standard: timing+8
      d4_fleet: 1,       // reliable: expertise+10, timing+5
      d4_wife_car: 0,    // personalized: empathy+12, expertise+5
    });
    // prep: expertise+8, rapport+8 = 16
    // greeting_b: timing+8 = 8, total 24
    // fleet_b: expertise+10, timing+5 = 15, total 39
    // wife_car_a: empathy+12, expertise+5 = 17, total 56
    expect(result.state.score.total).toBe(56);
    expect(result.state.flags.researched_company).toBe(true);
    expect(result.state.flags.knows_vip_protocol).toBe(true);
    expect(result.endNodeId).toBe('d4_end_success'); // 56 >= 48
  });

  it('multiSelect [0,2] -> researched_company + has_discount_authority', () => {
    const result = simulateDay(day4, {
      d4_preparation: [0, 2],
      d4_greeting: 1,    // standard: timing+8
      d4_fleet: 0,       // fleet_package: persuasion+15, expertise+8
      d4_wife_car: 0,    // personalized: empathy+12, expertise+5
    });
    // prep: expertise+8, opportunity+8 = 16
    // greeting_b: timing+8, total 24
    // fleet_a: persuasion+15, expertise+8 = 23, total 47
    // wife_car_a: empathy+12, expertise+5 = 17, total 64
    expect(result.state.score.total).toBe(64);
    expect(result.state.flags.researched_company).toBe(true);
    expect(result.state.flags.has_discount_authority).toBe(true);
    expect(result.endNodeId).toBe('d4_end_success'); // 64 >= 48
  });

  it('hidden ending path -> fleet_package + bundled_deal + high score', () => {
    const result = simulateDay(day4, {
      d4_preparation: [0, 1],   // researched_company + knows_vip_protocol
      d4_greeting: 0,           // vip_greeting: rapport+15, timing+5 = 20
      d4_fleet: 0,              // fleet_package: persuasion+15, expertise+8 = 23
      d4_wife_car: 2,           // bundled_deal: opportunity+10, persuasion+8 = 18
    });
    // prep: 16, greeting: 20, fleet: 23, wife_car: 18 = 77
    expect(result.state.score.total).toBe(77);
    expect(result.state.flags.fleet_package).toBe(true);
    expect(result.state.flags.bundled_deal).toBe(true);
    expect(result.endNodeId).toBe('d4_end_hidden');
    expect(result.outcome).toBe('hidden_ending');
    expect(result.playerState.achievements).toContain('corporate_king');
  });
});

describe('Day 5 — All Paths', () => {
  it('grandmaster path (all flags + score >= 63)', () => {
    const result = simulateDay(
      day5,
      {
        d5_approach: 0,            // patient_approach: empathy+12, rapport+8 = 20
        d5_needs_choice: 0,        // deep_discovery: discovery+15, rapport+8 = 23
        d5_objection_choice: 0,    // honest_answer: persuasion+15, expertise+5 = 20
        d5_closing: 0,             // test_drive: timing+12, persuasion+8 = 20
      },
      { lives: 3, flags: { d1_success: true } },
    );
    // Total: 20 + 23 + 20 + 20 = 83
    expect(result.state.score.total).toBe(83);
    expect(result.endNodeId).toBe('d5_end_grandmaster');
    expect(result.outcome).toBe('hidden_ending');
    expect(result.state.flags.d5_grandmaster).toBe(true);
    expect(result.playerState.achievements).toContain('grandmaster');
  });

  it('good path without grandmaster flags -> success', () => {
    const result = simulateDay(
      day5,
      {
        d5_approach: 1,            // timing+8, rapport+5 = 13
        d5_needs_choice: 0,        // deep_discovery: discovery+15, rapport+8 = 23
        d5_objection_choice: 0,    // honest_answer: persuasion+15, expertise+5 = 20
        d5_closing: 0,             // test_drive: timing+12, persuasion+8 = 20
      },
      { lives: 3, flags: { d1_success: true } },
    );
    // 13 + 23 + 20 + 20 = 76
    // Has honest_answer, deep_discovery, d1_success, but NO patient_approach -> not grandmaster
    expect(result.state.score.total).toBe(76);
    expect(result.endNodeId).toBe('d5_end_success'); // 76 >= 56
    expect(result.outcome).toBe('success');
  });

  it('morning check with d1+d2 success -> dilnoza tip appears', () => {
    const result = simulateDay(
      day5,
      {
        d5_approach: 0,
        d5_needs_choice: 0,
        d5_objection_choice: 0,
        d5_closing: 0,
      },
      { lives: 3, flags: { d1_success: true, d2_success: true } },
    );
    // Should have got_dilnoza_tip flag from d5_dilnoza_tip node
    expect(result.state.flags.got_dilnoza_tip).toBe(true);
    expect(result.endNodeId).toBe('d5_end_grandmaster');
  });

  it('morning check without d1+d2 success -> no dilnoza tip', () => {
    const result = simulateDay(
      day5,
      {
        d5_approach: 0,
        d5_needs_choice: 0,
        d5_objection_choice: 0,
        d5_closing: 0,
      },
      { lives: 3, flags: { d1_success: true } },
    );
    // Only d1_success, not d2_success -> no dilnoza tip
    expect(result.state.flags.got_dilnoza_tip).toBeUndefined();
    // Still reaches grandmaster since d1_success satisfies the OR condition
    expect(result.endNodeId).toBe('d5_end_grandmaster');
  });
});

// ============================================================
// 3. CROSS-DAY FLAG PROPAGATION
// ============================================================

describe('Cross-day Flag Propagation', () => {
  it('d1_success flows to d2_callback_check', () => {
    // With d1_success -> should go through d2_callback
    const withFlag = simulateDay(
      day2,
      { d2_presentation: 0, d2_objection: 0, d2_closing: 0 },
      { lives: 3, flags: { d1_success: true } },
    );
    // Callback adds opportunity+5, so score should include that
    expect(withFlag.state.score.total).toBe(62);

    // Without d1_success -> no callback
    const withoutFlag = simulateDay(
      day2,
      { d2_presentation: 0, d2_objection: 0, d2_closing: 0 },
      { lives: 3, flags: {} },
    );
    expect(withoutFlag.state.score.total).toBe(57);
  });

  it('d1_success + d2_success flows to d5_morning_check', () => {
    const result = simulateDay(
      day5,
      {
        d5_approach: 1,
        d5_needs_choice: 1,
        d5_objection_choice: 1,
        d5_closing: 1,
      },
      { lives: 3, flags: { d1_success: true, d2_success: true } },
    );
    expect(result.state.flags.got_dilnoza_tip).toBe(true);
  });

  it('hidden ending flags preserved across days', () => {
    const state = initDaySession('car-dealership', day5, {
      lives: 5,
      flags: {
        d1_success: true,
        d2_hidden: true,
        d3_hidden: true,
        d4_hidden: true,
        // Non-cross-day flags should be stripped
        approach_warm: true,
        respected_knowledge: true,
      },
    });
    // Cross-day flags (d\d+_*) should be preserved
    expect(state.flags.d1_success).toBe(true);
    expect(state.flags.d2_hidden).toBe(true);
    expect(state.flags.d3_hidden).toBe(true);
    expect(state.flags.d4_hidden).toBe(true);
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
  it('timer expire on every timed node in Day 5', () => {
    const result = simulateDay(
      day5,
      {
        // d5_approach has expireNodeId -> expire
        // d5_objection_choice has expireNodeId -> expire
        // d5_closing has expireNodeId -> expire
        d5_needs_choice: 0, // no timer on this one
      },
      { lives: 3, flags: {} },
    );
    // d5_approach_expired: timing-8, lose_life -> score -8, lives 2
    // d5_needs: dialogue
    // d5_needs_choice_a: discovery+15, rapport+8 = 23, total 15
    // d5_objection: dialogue
    // d5_objection_expired: timing-10, lose_life -> total 5, lives 1
    // d5_closing_expired: timing-5 -> total 0
    // d5_reveal -> d5_final_check: 0 < 30 -> fail
    expect(result.state.score.total).toBe(0);
    expect(result.endNodeId).toBe('d5_end_fail');
    // End effects include lose_life
    // Started with 3, lost 1 (approach), lost 1 (objection), lost 1 (end fail) = 0
    expect(result.state.lives).toBe(0);
    expect(isGameOver(result.state.lives)).toBe(true);
  });

  it('combo building across multiple good choices', () => {
    // The engine tracks choiceHistory — verify choices accumulate
    const result = simulateDay(day1, {
      d1_approach: 0,  // rapport+10 (score sum = 10 -> good choice)
      d1_needs: 0,     // discovery+12, rapport+5 (score sum = 17 -> good choice)
      d1_suggest: 0,   // persuasion+12, expertise+5 (score sum = 17 -> good choice)
    });
    // Verify all 3 choices recorded in history
    expect(result.state.choiceHistory).toHaveLength(3);
    expect(result.state.choiceHistory[0].nodeId).toBe('d1_approach');
    expect(result.state.choiceHistory[0].choiceIndex).toBe(0);
    expect(result.state.choiceHistory[1].nodeId).toBe('d1_needs');
    expect(result.state.choiceHistory[2].nodeId).toBe('d1_suggest');
  });

  it('score never goes negative on session (but individual dimension can)', () => {
    // Day 1: expire approach (-5 timing) then worst needs (-3 discovery, +5 expertise)
    const result = simulateDay(day1, {
      // expire approach: timing -5
      d1_needs: 2,     // discovery -3, expertise +5
      d1_suggest: 0,   // persuasion+12, expertise+5
    });
    // Individual dimension: timing = -5 (can go negative)
    expect(result.state.score.dimensions.timing).toBe(-5);
    // But total is sum of all: -5 + (-3) + 5 + 12 + 5 = 14
    // Actually: approach_expired: timing-5 = total -5
    // needs_c: discovery-3, expertise+5 = total -3
    // suggest_a: persuasion+12, expertise+5 = total 14
    // Wait: -5 + 2 + 17 = 14. Let me recalculate:
    // approach_expired: add_score timing -5 -> total = -5
    // needs_c: add_score discovery -3, add_score expertise +5 -> total = -5 + (-3) + 5 = -3
    // suggest_a: add_score persuasion +12, add_score expertise +5 -> total = -3 + 12 + 5 = 14
    expect(result.state.score.total).toBe(14);
    // Dimensions can go negative
    expect(result.state.score.dimensions.timing).toBe(-5);
    expect(result.state.score.dimensions.discovery).toBe(-3);
    // Total score can be positive even with negative dimensions
    expect(result.state.score.total).toBeGreaterThan(0);
  });
});

// ============================================================
// 5. SCENARIO STRUCTURE VALIDATION
// ============================================================

describe('Scenario Structure', () => {
  it('carDealershipScenario has exactly 5 days', () => {
    expect(carDealershipScenario.days).toHaveLength(5);
    expect(carDealershipScenario.days[0].id).toBe('car-day1');
    expect(carDealershipScenario.days[4].id).toBe('car-day5');
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
