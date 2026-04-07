// ============================================================
// ScoringSystem — Pure functions for scoring logic
// No React imports. No side effects.
// ============================================================

import type { Rating } from '@/game/engine/types';

// --- Rating thresholds (percentage of targetScore) ---
const RATING_THRESHOLDS: Array<{ min: number; rating: Rating }> = [
  { min: 0.90, rating: 'S' },
  { min: 0.75, rating: 'A' },
  { min: 0.60, rating: 'B' },
  { min: 0.40, rating: 'C' },
  { min: 0.20, rating: 'D' },
];

/**
 * Calculate a letter rating from a raw score and target.
 *
 * Edge cases:
 *  - targetScore 0 → 'S' (avoid divide-by-zero)
 *  - negative score → 'F'
 *  - score > target → 'S'
 */
export function calculateRating(score: number, targetScore: number): Rating {
  if (targetScore === 0) return 'S';
  if (score < 0) return 'F';

  const pct = score / targetScore;

  for (const { min, rating } of RATING_THRESHOLDS) {
    if (pct >= min) return rating;
  }

  return 'F';
}

/**
 * Return the score multiplier for a given combo streak.
 *
 *  0-3  → 1.0
 *  4    → 1.5
 *  5+   → 2.0
 */
export function getComboMultiplier(comboCount: number): number {
  if (comboCount >= 5) return 2.0;
  if (comboCount >= 4) return 1.5;
  return 1.0;
}

/**
 * Update combo counter based on the sum of scores from a choice.
 *
 *  choiceScoreSum >= 10 → increment
 *  choiceScoreSum <= 0  → reset to 0
 *  1-9                  → unchanged
 */
export function updateCombo(comboCount: number, choiceScoreSum: number): number {
  if (choiceScoreSum >= 10) return comboCount + 1;
  if (choiceScoreSum <= 0) return 0;
  return comboCount;
}

/**
 * Apply score modifiers additively then multiply against base.
 *
 *  speedBonus:    +10%
 *  firstTry:      +15%
 *  noTimerExpire:  +5%
 */
export function applyModifiers(
  baseScore: number,
  modifiers: { speedBonus: boolean; firstTry: boolean; noTimerExpire: boolean },
): number {
  let bonus = 0;
  if (modifiers.speedBonus) bonus += 0.10;
  if (modifiers.firstTry) bonus += 0.15;
  if (modifiers.noTimerExpire) bonus += 0.05;
  return Math.round(baseScore * (1 + bonus) * 100) / 100;
}

/**
 * Detect if the player is within 5% of targetScore from the next rating tier.
 *
 * Returns info about the near miss, or null if not applicable.
 */
export function getNearMiss(
  score: number,
  targetScore: number,
): { currentRating: Rating; nextRating: Rating; pointsNeeded: number } | null {
  if (targetScore === 0) return null;

  const currentRating = calculateRating(score, targetScore);

  // Already at the top — nothing to be "near"
  if (currentRating === 'S') return null;

  // Find the next higher rating threshold
  const ratingOrder: Rating[] = ['F', 'D', 'C', 'B', 'A', 'S'];
  const currentIdx = ratingOrder.indexOf(currentRating);
  const nextRating = ratingOrder[currentIdx + 1];

  // Find the threshold percentage for the next rating
  const thresholdEntry = RATING_THRESHOLDS.find((t) => t.rating === nextRating);
  if (!thresholdEntry) return null;

  const thresholdScore = Math.ceil(thresholdEntry.min * targetScore);
  const pointsNeeded = thresholdScore - score;

  // Within 5% of targetScore?
  if (pointsNeeded > 0 && pointsNeeded / targetScore <= 0.05) {
    return { currentRating, nextRating, pointsNeeded };
  }

  return null;
}

/**
 * Deterministic Fisher-Yates shuffle using a seeded PRNG.
 * Same seed always produces the same order.
 */
export function shuffleChoices<T>(choices: T[], seed: string): T[] {
  if (choices.length <= 1) return [...choices];

  const arr = [...choices];
  let h = seedToHash(seed);

  for (let i = arr.length - 1; i > 0; i--) {
    h = xorshift32(h);
    const j = (h >>> 0) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

// --- Internal: simple seeded PRNG helpers ---

function seedToHash(seed: string): number {
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
  }
  return h >>> 0;
}

function xorshift32(state: number): number {
  let s = state;
  s ^= s << 13;
  s ^= s >> 17;
  s ^= s << 5;
  return s >>> 0;
}
