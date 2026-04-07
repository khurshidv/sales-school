// ============================================================
// TimerSystem — Pure functions for timer management
// No setInterval, no side effects, all time passed as argument
// ============================================================

import type { TimerState } from '@/game/engine/types';

/** Create a new timer state */
export function startTimer(duration: number, now: number): TimerState {
  return {
    startedAt: now,
    duration,
    pausedAt: null,
    remaining: duration,
  };
}

/** Freeze the timer at the current moment. Noop if already paused. */
export function pauseTimer(state: TimerState, now: number): TimerState {
  if (state.pausedAt !== null) {
    return state;
  }
  const elapsed = (now - state.startedAt) / 1000;
  const remaining = Math.max(0, state.remaining - elapsed);
  return {
    ...state,
    pausedAt: now,
    remaining,
  };
}

/** Resume a paused timer. Resets startedAt so elapsed is calculated from resume point. */
export function resumeTimer(state: TimerState, now: number): TimerState {
  if (state.pausedAt === null) {
    return state;
  }
  return {
    ...state,
    startedAt: now,
    pausedAt: null,
    // remaining stays as frozen value — will be decremented from new startedAt
  };
}

/** Get seconds remaining (min 0). Accounts for pause state. */
export function getRemaining(state: TimerState, now: number): number {
  if (state.pausedAt !== null) {
    return state.remaining;
  }
  const elapsed = (now - state.startedAt) / 1000;
  return Math.max(0, state.remaining - elapsed);
}

/** Check if the timer has expired */
export function isExpired(state: TimerState, now: number): boolean {
  return getRemaining(state, now) <= 0;
}
