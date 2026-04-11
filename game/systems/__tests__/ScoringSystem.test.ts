import { describe, it, expect } from 'vitest';
import {
  calculateRating,
  getComboMultiplier,
  updateCombo,
  applyModifiers,
  getNearMiss,
  shuffleChoices,
  calculateWeightedTotal,
  getStrongestWeighted,
  getWeakestWeighted,
  DIMENSION_WEIGHTS,
} from '@/game/systems/ScoringSystem';
import type { DimensionScores } from '@/game/engine/types';

function dims(partial: Partial<DimensionScores>): DimensionScores {
  return {
    empathy: 0,
    rapport: 0,
    timing: 0,
    expertise: 0,
    persuasion: 0,
    discovery: 0,
    opportunity: 0,
    ...partial,
  };
}

// ============================================================
// 1. calculateRating — 15 tests
// ============================================================
describe('calculateRating', () => {
  // S rating: >= 90%
  it('returns S when score is exactly 90% of target', () => {
    expect(calculateRating(90, 100)).toBe('S');
  });

  it('returns A when score is 89% of target (just below S)', () => {
    expect(calculateRating(89, 100)).toBe('A');
  });

  // A rating: >= 75%
  it('returns A when score is exactly 75% of target', () => {
    expect(calculateRating(75, 100)).toBe('A');
  });

  it('returns B when score is 74% of target (just below A)', () => {
    expect(calculateRating(74, 100)).toBe('B');
  });

  // B rating: >= 60%
  it('returns B when score is exactly 60% of target', () => {
    expect(calculateRating(60, 100)).toBe('B');
  });

  it('returns C when score is 59% of target (just below B)', () => {
    expect(calculateRating(59, 100)).toBe('C');
  });

  // C rating: >= 40%
  it('returns C when score is exactly 40% of target', () => {
    expect(calculateRating(40, 100)).toBe('C');
  });

  it('returns D when score is 39% of target (just below C)', () => {
    expect(calculateRating(39, 100)).toBe('D');
  });

  // D rating: >= 20%
  it('returns D when score is exactly 20% of target', () => {
    expect(calculateRating(20, 100)).toBe('D');
  });

  it('returns F when score is 19% of target (just below D)', () => {
    expect(calculateRating(19, 100)).toBe('F');
  });

  // F rating: < 20%
  it('returns F when score is 0', () => {
    expect(calculateRating(0, 100)).toBe('F');
  });

  // Edge: targetScore 0 -> S
  it('returns S when targetScore is 0 (avoid divide by zero)', () => {
    expect(calculateRating(0, 0)).toBe('S');
  });

  // Edge: negative score -> F
  it('returns F when score is negative', () => {
    expect(calculateRating(-10, 100)).toBe('F');
  });

  // Edge: score > target -> S
  it('returns S when score exceeds target', () => {
    expect(calculateRating(150, 100)).toBe('S');
  });

  // Non-round target
  it('returns correct rating with non-round target score', () => {
    // 45/50 = 90% -> S
    expect(calculateRating(45, 50)).toBe('S');
  });
});

// ============================================================
// 2. getComboMultiplier + updateCombo — 8 tests
// ============================================================
describe('getComboMultiplier', () => {
  it('returns 1.0 for combo count 0', () => {
    expect(getComboMultiplier(0)).toBe(1.0);
  });

  it('returns 1.0 for combo count 3', () => {
    expect(getComboMultiplier(3)).toBe(1.0);
  });

  it('returns 1.5 for combo count 4', () => {
    expect(getComboMultiplier(4)).toBe(1.5);
  });

  it('returns 2.0 for combo count 5', () => {
    expect(getComboMultiplier(5)).toBe(2.0);
  });

  it('returns 2.0 for combo count 10', () => {
    expect(getComboMultiplier(10)).toBe(2.0);
  });
});

describe('updateCombo', () => {
  it('increments combo when choiceScoreSum >= 10', () => {
    expect(updateCombo(3, 10)).toBe(4);
  });

  it('resets combo to 0 when choiceScoreSum <= 0', () => {
    expect(updateCombo(5, 0)).toBe(0);
  });

  it('keeps combo unchanged when choiceScoreSum is between 1 and 9', () => {
    expect(updateCombo(3, 5)).toBe(3);
  });
});

// ============================================================
// 3. applyModifiers — 4 tests
// ============================================================
describe('applyModifiers', () => {
  it('applies speedBonus (+10%) only', () => {
    expect(applyModifiers(100, { speedBonus: true, firstTry: false, noTimerExpire: false })).toBe(110);
  });

  it('applies firstTry (+15%) only', () => {
    expect(applyModifiers(100, { speedBonus: false, firstTry: true, noTimerExpire: false })).toBe(115);
  });

  it('applies noTimerExpire (+5%) only', () => {
    expect(applyModifiers(100, { speedBonus: false, firstTry: false, noTimerExpire: true })).toBe(105);
  });

  it('applies all modifiers additively (+30%)', () => {
    expect(applyModifiers(100, { speedBonus: true, firstTry: true, noTimerExpire: true })).toBe(130);
  });
});

// ============================================================
// 4. getNearMiss — 4 tests
// ============================================================
describe('getNearMiss', () => {
  it('detects near-miss to S rating (score within 5% of 90% threshold)', () => {
    // target=100, S threshold at 90. Score=86 -> 86% -> needs 90-86=4 points.
    // 4/100 = 4% < 5% -> near miss
    const result = getNearMiss(86, 100);
    expect(result).not.toBeNull();
    expect(result!.currentRating).toBe('A');
    expect(result!.nextRating).toBe('S');
    expect(result!.pointsNeeded).toBe(4);
  });

  it('detects near-miss to A rating', () => {
    // target=100, A threshold at 75. Score=71 -> 71% -> needs 75-71=4 points.
    // 4/100 = 4% < 5% -> near miss
    const result = getNearMiss(71, 100);
    expect(result).not.toBeNull();
    expect(result!.currentRating).toBe('B');
    expect(result!.nextRating).toBe('A');
    expect(result!.pointsNeeded).toBe(4);
  });

  it('returns null when not near any threshold', () => {
    // target=100, score=50 -> C rating. Next threshold B at 60. Gap=10. 10/100 = 10% > 5%
    const result = getNearMiss(50, 100);
    expect(result).toBeNull();
  });

  it('returns null when already at S rating', () => {
    const result = getNearMiss(95, 100);
    expect(result).toBeNull();
  });
});

// ============================================================
// 5. shuffleChoices — 4 tests
// ============================================================
describe('shuffleChoices', () => {
  it('produces deterministic results with same seed', () => {
    const choices = ['a', 'b', 'c', 'd', 'e'];
    const result1 = shuffleChoices(choices, 'seed42');
    const result2 = shuffleChoices(choices, 'seed42');
    expect(result1).toEqual(result2);
  });

  it('produces different order with different seed', () => {
    const choices = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const result1 = shuffleChoices(choices, 'seed1');
    const result2 = shuffleChoices(choices, 'seed2');
    // With 8 elements, the probability of same order is 1/8! = negligible
    expect(result1).not.toEqual(result2);
  });

  it('returns empty array for empty input', () => {
    expect(shuffleChoices([], 'seed')).toEqual([]);
  });

  it('returns single-element array unchanged', () => {
    expect(shuffleChoices(['only'], 'seed')).toEqual(['only']);
  });
});

// ============================================================
// 7. calculateWeightedTotal / getStrongestWeighted / getWeakestWeighted
// ============================================================
describe('calculateWeightedTotal', () => {
  it('returns 0 for all zeros', () => {
    expect(calculateWeightedTotal(dims({}))).toBe(0);
  });

  it('applies per-dimension weights correctly', () => {
    const result = calculateWeightedTotal(dims({ opportunity: 10 }));
    expect(result).toBe(10 * DIMENSION_WEIGHTS.opportunity); // 15
  });

  it('sums weighted contributions across multiple dimensions', () => {
    const result = calculateWeightedTotal(
      dims({ discovery: 10, expertise: 10 }),
    );
    // discovery 1.4 + expertise 0.8 = 14 + 8 = 22
    expect(result).toBe(22);
  });

  it('rounds to 2 decimals', () => {
    const result = calculateWeightedTotal(dims({ persuasion: 3 }));
    // 3 * 0.9 = 2.7
    expect(result).toBe(2.7);
  });
});

describe('getStrongestWeighted', () => {
  it('returns dimension with highest weighted contribution, not highest raw', () => {
    // raw: empathy=15, opportunity=12
    // weighted: empathy=18, opportunity=18 — tie, should fall to first seen
    // Clearer case: raw discovery=10, raw rapport=12
    // weighted: discovery=14, rapport=14.4 → rapport wins
    const result = getStrongestWeighted(
      dims({ discovery: 10, rapport: 12 }),
    );
    expect(result).toBe('rapport');
  });

  it('weights can flip the result vs raw max', () => {
    // raw: expertise=20, opportunity=15
    // weighted: expertise=16, opportunity=22.5 → opportunity wins despite lower raw
    const result = getStrongestWeighted(
      dims({ expertise: 20, opportunity: 15 }),
    );
    expect(result).toBe('opportunity');
  });

  it('handles all-zeros without crashing', () => {
    expect(getStrongestWeighted(dims({}))).toBeDefined();
  });
});

describe('getWeakestWeighted', () => {
  it('returns dimension with lowest weighted contribution', () => {
    // All equal raw, weakest weight wins → expertise (0.8)
    const result = getWeakestWeighted(
      dims({
        empathy: 5,
        rapport: 5,
        timing: 5,
        expertise: 5,
        persuasion: 5,
        discovery: 5,
        opportunity: 5,
      }),
    );
    expect(result).toBe('expertise');
  });

  it('ignores high raw in heavily weighted dimensions', () => {
    // opportunity=100 weighted=150, expertise=0 weighted=0 — expertise is weakest
    const result = getWeakestWeighted(
      dims({ opportunity: 100 }),
    );
    // All non-opportunity are 0 → first seen with 0 wins; key order empathy/rapport/timing/expertise/persuasion/discovery/opportunity
    // All have weighted=0 except opportunity, so first-seen zero is empathy
    expect(result).toBe('empathy');
  });
});

describe('DIMENSION_WEIGHTS', () => {
  it('has all 7 dimensions', () => {
    expect(Object.keys(DIMENSION_WEIGHTS)).toHaveLength(7);
  });

  it('opportunity is highest weighted (1.5)', () => {
    expect(DIMENSION_WEIGHTS.opportunity).toBe(1.5);
    for (const w of Object.values(DIMENSION_WEIGHTS)) {
      expect(DIMENSION_WEIGHTS.opportunity).toBeGreaterThanOrEqual(w);
    }
  });

  it('expertise is lowest weighted (0.8)', () => {
    expect(DIMENSION_WEIGHTS.expertise).toBe(0.8);
    for (const w of Object.values(DIMENSION_WEIGHTS)) {
      expect(DIMENSION_WEIGHTS.expertise).toBeLessThanOrEqual(w);
    }
  });
});
