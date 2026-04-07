// ============================================================
// LivesSystem — Pure functions for life management
// No React, no side effects
// ============================================================

import type {
  Rating,
  DayOutcome,
  GameSessionState,
  Day,
} from '@/game/engine/types';
import { createEmptyDimensionScores } from '@/game/engine/types';

/** Decrement lives, minimum 0 */
export function loseLife(lives: number): number {
  return Math.max(0, lives - 1);
}

/** Increment lives, maximum maxLives */
export function gainLife(lives: number, maxLives: number): number {
  return Math.min(maxLives, lives + 1);
}

/** Game is over when lives reach 0 or below */
export function isGameOver(lives: number): boolean {
  return lives <= 0;
}

/** Player loses a life only on F rating */
export function shouldLoseLife(rating: Rating): boolean {
  return rating === 'F';
}

/** Player gains a life only on hidden_ending outcome */
export function shouldGainLife(outcome: DayOutcome): boolean {
  return outcome === 'hidden_ending';
}

/** Cross-day flag pattern: starts with 'd' followed by a digit then '_' */
const CROSS_DAY_FLAG_RE = /^d\d+_/;

/**
 * Reset session for game-over restart:
 * - currentNodeId = day's rootNodeId
 * - score = 0
 * - flags = only cross-day flags preserved
 * - comboCount = 0
 * - lives = 1
 * - isReplay = true
 * - isGameOverRestart = true
 */
export function handleGameOver(
  state: GameSessionState,
  day: Day,
): GameSessionState {
  const crossDayFlags: Record<string, boolean> = {};
  for (const key of Object.keys(state.flags)) {
    if (CROSS_DAY_FLAG_RE.test(key)) {
      crossDayFlags[key] = state.flags[key];
    }
  }

  return {
    ...state,
    currentNodeId: day.rootNodeId,
    score: { total: 0, dimensions: createEmptyDimensionScores() },
    flags: crossDayFlags,
    comboCount: 0,
    lives: 1,
    isReplay: true,
    isGameOverRestart: true,
  };
}
