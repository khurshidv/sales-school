// ============================================================
// LevelSystem — Pure functions for XP and level progression
// Formula: xpForLevel(n) = floor(100 * n^1.5)
// ============================================================

import type { PlayerState } from '@/game/engine/types';

/** XP required to complete a given level (cumulative threshold = sum of xpForLevel(1..level)) */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/** Calculate the player's level from cumulative XP */
export function calculateLevel(totalXp: number): number {
  let level = 1;
  let cumulativeXp = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (cumulativeXp + needed > totalXp) {
      break;
    }
    cumulativeXp += needed;
    level++;
  }
  return level;
}

/** Add XP and recalculate level, returning a new PlayerState */
export function addXp(playerState: PlayerState, amount: number): PlayerState {
  const totalXp = playerState.totalXp + amount;
  const level = calculateLevel(totalXp);
  return { ...playerState, totalXp, level };
}

/** XP remaining to reach the next level */
export function xpToNextLevel(level: number, totalXp: number): number {
  let cumulativeXp = 0;
  for (let l = 1; l < level; l++) {
    cumulativeXp += xpForLevel(l);
  }
  const threshold = cumulativeXp + xpForLevel(level);
  return threshold - totalXp;
}

/** Progress through current level as a fraction 0.0 - 1.0 */
export function getProgress(level: number, totalXp: number): number {
  let cumulativeXp = 0;
  for (let l = 1; l < level; l++) {
    cumulativeXp += xpForLevel(l);
  }
  const xpIntoLevel = totalXp - cumulativeXp;
  const needed = xpForLevel(level);
  if (needed === 0) return 1.0;
  return Math.min(1.0, Math.max(0.0, xpIntoLevel / needed));
}
