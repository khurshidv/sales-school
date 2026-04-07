import { describe, it, expect } from 'vitest';
import {
  addCoins,
  spendCoin,
  canReplay,
  getCoinsForOutcome,
  getCoinsForAchievement,
  getCoinsForFirstCompletion,
} from '@/game/systems/CoinSystem';

// ============================================================
// 1. addCoins — 1 test
// ============================================================
describe('addCoins', () => {
  it('adds amount to current coins (0 + 2 = 2)', () => {
    expect(addCoins(0, 2)).toBe(2);
  });
});

// ============================================================
// 2. spendCoin — 2 tests
// ============================================================
describe('spendCoin', () => {
  it('succeeds when coins >= cost (3 - 1 = {success:true, remaining:2})', () => {
    expect(spendCoin(3, 1)).toEqual({ success: true, remaining: 2 });
  });

  it('fails when coins < cost (0 - 1 = {success:false, remaining:0})', () => {
    expect(spendCoin(0, 1)).toEqual({ success: false, remaining: 0 });
  });
});

// ============================================================
// 3. canReplay — 2 tests
// ============================================================
describe('canReplay', () => {
  it('returns false when coins = 0', () => {
    expect(canReplay(0)).toBe(false);
  });

  it('returns true when coins >= 1', () => {
    expect(canReplay(1)).toBe(true);
  });
});

// ============================================================
// 4. getCoinsForOutcome — 3 tests
// ============================================================
describe('getCoinsForOutcome', () => {
  it('returns 2 for hidden_ending outcome', () => {
    expect(getCoinsForOutcome('hidden_ending', 'B')).toBe(2);
  });

  it('returns 1 for S rating (non-hidden)', () => {
    expect(getCoinsForOutcome('success', 'S')).toBe(1);
  });

  it('returns 0 for partial outcome with non-S rating', () => {
    expect(getCoinsForOutcome('partial', 'B')).toBe(0);
  });
});

// ============================================================
// 5. getCoinsForAchievement — 1 test
// ============================================================
describe('getCoinsForAchievement', () => {
  it('always returns 1', () => {
    expect(getCoinsForAchievement()).toBe(1);
  });
});

// ============================================================
// 6. getCoinsForFirstCompletion — 1 test (total: 8 + 2 extra = 10)
// ============================================================
describe('getCoinsForFirstCompletion', () => {
  it('always returns 3', () => {
    expect(getCoinsForFirstCompletion()).toBe(3);
  });
});
