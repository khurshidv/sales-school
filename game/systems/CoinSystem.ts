// ============================================================
// CoinSystem — Pure TS, no React
// Manages coin economy: earning, spending, replay gating
// ============================================================

import type { DayOutcome, Rating } from '@/game/engine/types';

/** Add coins to current total. */
export function addCoins(coins: number, amount: number): number {
  return coins + amount;
}

/** Spend coins if affordable. Returns success flag and remaining balance. */
export function spendCoin(
  coins: number,
  cost: number,
): { success: boolean; remaining: number } {
  if (coins < cost) {
    return { success: false, remaining: coins };
  }
  return { success: true, remaining: coins - cost };
}

/** Whether the player can afford a replay (costs 1 coin). */
export function canReplay(coins: number): boolean {
  return coins >= 1;
}

/** Coins earned from a day outcome + rating. */
export function getCoinsForOutcome(outcome: DayOutcome, rating: Rating): number {
  if (outcome === 'hidden_ending') return 2;
  if (rating === 'S') return 1;
  return 0;
}

/** Coins earned per achievement unlock. */
export function getCoinsForAchievement(): number {
  return 1;
}

/** Coins earned for first-ever scenario completion. */
export function getCoinsForFirstCompletion(): number {
  return 3;
}
