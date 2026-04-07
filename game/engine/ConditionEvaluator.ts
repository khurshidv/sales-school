// ============================================================
// Sales School Game Engine — Condition Evaluator
// Pure function: evaluates a Condition against game/player state
// ============================================================

import type { Condition, GameSessionState, PlayerState } from './types';

/**
 * Evaluates a condition tree against the current game session state
 * and optional player state. Returns true if the condition is met.
 *
 * Pure function — no side effects, no mutations.
 */
export function evaluateCondition(
  condition: Condition,
  state: GameSessionState,
  playerState?: PlayerState,
): boolean {
  switch (condition.type) {
    case 'score_gte':
      return state.score.total >= condition.value;

    case 'score_lte':
      return state.score.total <= condition.value;

    case 'flag':
      return state.flags[condition.flag] === true;

    case 'has_achievement':
      return playerState?.achievements.includes(condition.achievementId) ?? false;

    case 'choice_was': {
      const entry = state.choiceHistory.find(
        (h) => h.nodeId === condition.nodeId,
      );
      return entry?.choiceIndex === condition.choiceIndex;
    }

    case 'lives_gte':
      return state.lives >= condition.value;

    case 'level_gte':
      return (playerState?.level ?? 0) >= condition.value;

    case 'and':
      return condition.conditions.every((c) =>
        evaluateCondition(c, state, playerState),
      );

    case 'or':
      return condition.conditions.some((c) =>
        evaluateCondition(c, state, playerState),
      );

    case 'not':
      return !evaluateCondition(condition.condition, state, playerState);

    default:
      return false;
  }
}
