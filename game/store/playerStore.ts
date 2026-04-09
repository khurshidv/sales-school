// ============================================================
// Sales School — Player Store (Zustand, in-memory only)
// Supabase is the source of truth. This store is hydrated
// on mount via usePlayerInit hook. No localStorage persist.
// ============================================================

import { create } from 'zustand';
import type { PlayerState, CompletedScenarioRecord } from '@/game/engine/types';
import { addXp as levelAddXp } from '@/game/systems/LevelSystem';

export interface PlayerStore {
  player: PlayerState | null;
  isLoading: boolean;
  isInitialized: boolean;

  setLoading: (loading: boolean) => void;
  setInitialized: () => void;
  createPlayer: (name: string, phone: string, avatarId: 'male' | 'female') => void;
  loadPlayer: (player: PlayerState) => void;
  addXp: (amount: number) => void;
  addAchievement: (id: string) => void;
  addCoins: (amount: number) => void;
  spendCoin: () => boolean;
  addCompletedScenario: (record: CompletedScenarioRecord) => void;
  reset: () => void;
}

export const createPlayerStore = () =>
  create<PlayerStore>()((set, get) => ({
    player: null,
    isLoading: true,
    isInitialized: false,

    setLoading: (loading) => set({ isLoading: loading }),
    setInitialized: () => set({ isInitialized: true, isLoading: false }),

    createPlayer: (name, phone, avatarId) => {
      set({
        player: {
          id: crypto.randomUUID(),
          phone,
          displayName: name,
          avatarId,
          level: 1,
          totalXp: 0,
          totalScore: 0,
          coins: 0,
          achievements: [],
          completedScenarios: [],
        },
      });
    },

    loadPlayer: (player) => {
      set({ player });
    },

    addXp: (amount) => {
      const { player } = get();
      if (!player) return;
      const updated = levelAddXp(player, amount);
      set({ player: updated });
    },

    addAchievement: (id) => {
      const { player } = get();
      if (!player) return;
      if (player.achievements.includes(id)) return;
      set({
        player: {
          ...player,
          achievements: [...player.achievements, id],
        },
      });
    },

    addCoins: (amount) => {
      const { player } = get();
      if (!player) return;
      set({
        player: {
          ...player,
          coins: player.coins + amount,
        },
      });
    },

    spendCoin: () => {
      const { player } = get();
      if (!player || player.coins <= 0) return false;
      set({
        player: {
          ...player,
          coins: player.coins - 1,
        },
      });
      return true;
    },

    addCompletedScenario: (record) => {
      const { player } = get();
      if (!player) return;
      set({
        player: {
          ...player,
          completedScenarios: [...player.completedScenarios, record],
        },
      });
    },

    reset: () => {
      set({ player: null, isLoading: false, isInitialized: false });
    },
  }));

// Default store instance (in-memory, hydrated by usePlayerInit)
export const usePlayerStore = createPlayerStore();
