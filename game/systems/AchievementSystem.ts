// ============================================================
// AchievementSystem — Pure TS, no React
// Checks and manages achievement unlocks
// ============================================================

import type {
  GameSessionState,
  PlayerState,
  DayOutcome,
  Rating,
} from '@/game/engine/types';

// --- Types ---

export interface AchievementContext {
  dayOutcome?: DayOutcome;
  dayRating?: Rating;
  dayIndex?: number;
  isReplay?: boolean;
  previousRating?: Rating;
}

export interface AchievementDefinition {
  id: string;
  category: 'progress' | 'skill' | 'hidden';
  xpReward: number;
  condition: (
    state: GameSessionState,
    player: PlayerState,
    context: AchievementContext,
  ) => boolean;
}

// --- Achievement Definitions ---

const HIDDEN_ACHIEVEMENT_IDS = [
  'respect_earns_referrals',
  'love_sells',
  'corporate_king',
  'grandmaster',
] as const;

const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  // ── Progress ──────────────────────────────────────────────
  {
    id: 'first_contact',
    category: 'progress',
    xpReward: 50,
    condition: (_state, _player, ctx) =>
      ctx.dayIndex === 0 && ctx.dayOutcome === 'success',
  },
  {
    id: 'final_test_passed',
    category: 'progress',
    xpReward: 100,
    condition: (_state, _player, ctx) =>
      ctx.dayIndex === 4 && ctx.dayOutcome === 'success',
  },
  {
    id: 'full_week',
    category: 'progress',
    xpReward: 200,
    condition: (_state, player) => {
      const uniqueDays = new Set(player.completedScenarios.map((s) => s.dayIndex));
      return uniqueDays.size >= 5;
    },
  },
  {
    id: 'car_master',
    category: 'progress',
    xpReward: 500,
    condition: (_state, player) => {
      if (player.completedScenarios.length === 0) return false;
      const bestByDay = new Map<number, Rating>();
      for (const s of player.completedScenarios) {
        const current = bestByDay.get(s.dayIndex);
        if (!current || isHigherRating(s.rating, current)) {
          bestByDay.set(s.dayIndex, s.rating);
        }
      }
      if (bestByDay.size < 5) return false;
      for (let d = 0; d < 5; d++) {
        const r = bestByDay.get(d);
        if (!r || (r !== 'S' && r !== 'A')) return false;
      }
      return true;
    },
  },
  {
    id: 'perfectionist',
    category: 'progress',
    xpReward: 750,
    condition: (_state, player) => {
      // All 5 days S, none are replays (one run)
      const nonReplay = player.completedScenarios.filter((s) => !s.isReplay);
      const sByDay = new Map<number, boolean>();
      for (const s of nonReplay) {
        if (s.rating === 'S') sByDay.set(s.dayIndex, true);
      }
      for (let d = 0; d < 5; d++) {
        if (!sByDay.get(d)) return false;
      }
      return true;
    },
  },

  // ── Skill ─────────────────────────────────────────────────
  {
    id: 'combo_king',
    category: 'skill',
    xpReward: 200,
    condition: (state) => state.comboCount >= 5,
  },
  {
    id: 'speed_demon',
    category: 'skill',
    xpReward: 150,
    condition: (state) => {
      const speedFlags = Object.keys(state.flags).filter(
        (f) => f.startsWith('speed_bonus_') && state.flags[f],
      );
      return speedFlags.length >= 3;
    },
  },
  {
    id: 'all_rounder',
    category: 'skill',
    xpReward: 400,
    condition: (state) => {
      const dims = state.score.dimensions;
      const values = Object.values(dims);
      const max = Math.max(...values);
      if (max === 0) return false;
      return values.every((v) => v >= max * 0.8);
    },
  },
  {
    id: 'comeback_kid',
    category: 'skill',
    xpReward: 150,
    condition: (_state, _player, ctx) =>
      ctx.previousRating === 'F' &&
      ctx.isReplay === true &&
      (ctx.dayRating === 'A' || ctx.dayRating === 'S'),
  },
  {
    id: 'no_pressure',
    category: 'skill',
    xpReward: 200,
    condition: (state) => state.flags['all_timed_in_first_half'] === true,
  },

  // ── Hidden ────────────────────────────────────────────────
  {
    id: 'respect_earns_referrals',
    category: 'hidden',
    xpReward: 150,
    condition: (_state, _player, ctx) =>
      ctx.dayIndex === 1 && ctx.dayOutcome === 'hidden_ending',
  },
  {
    id: 'love_sells',
    category: 'hidden',
    xpReward: 180,
    condition: (_state, _player, ctx) =>
      ctx.dayIndex === 2 && ctx.dayOutcome === 'hidden_ending',
  },
  {
    id: 'corporate_king',
    category: 'hidden',
    xpReward: 200,
    condition: (_state, _player, ctx) =>
      ctx.dayIndex === 3 && ctx.dayOutcome === 'hidden_ending',
  },
  {
    id: 'grandmaster',
    category: 'hidden',
    xpReward: 500,
    condition: (_state, _player, ctx) =>
      ctx.dayIndex === 4 && ctx.dayOutcome === 'hidden_ending',
  },
  {
    id: 'secret_hunter',
    category: 'hidden',
    xpReward: 300,
    condition: (_state, player) =>
      HIDDEN_ACHIEVEMENT_IDS.every((id) => player.achievements.includes(id)),
  },
] as const;

// --- Helpers ---

const RATING_ORDER: Record<Rating, number> = {
  S: 6,
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  F: 1,
};

function isHigherRating(a: Rating, b: Rating): boolean {
  return RATING_ORDER[a] > RATING_ORDER[b];
}

// --- Public API ---

/**
 * Returns IDs of achievements that are newly unlockable
 * (condition met AND not already in player.achievements).
 */
export function checkAchievements(
  state: GameSessionState,
  player: PlayerState,
  context: AchievementContext,
): string[] {
  return ACHIEVEMENT_DEFINITIONS.filter(
    (def) =>
      !player.achievements.includes(def.id) &&
      def.condition(state, player, context),
  ).map((def) => def.id);
}

/** Check if a specific achievement is already unlocked for a player. */
export function isUnlocked(achievementId: string, player: PlayerState): boolean {
  return player.achievements.includes(achievementId);
}

/** Get the definition of a single achievement by ID. */
export function getAchievementDefinition(
  id: string,
): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((def) => def.id === id);
}

/** Get all achievement definitions. */
export function getAllAchievements(): readonly AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS;
}
