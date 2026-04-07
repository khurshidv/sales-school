// ============================================================
// Achievements — Re-export from AchievementSystem
// ============================================================

export {
  getAllAchievements,
  getAchievementDefinition,
} from '@/game/systems/AchievementSystem';

export type {
  AchievementDefinition,
  AchievementContext,
} from '@/game/systems/AchievementSystem';
