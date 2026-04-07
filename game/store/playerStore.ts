// ============================================================
// Sales School — Player Store (Zustand + persist/localStorage)
// Manages persistent player profile across sessions.
// ============================================================

import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import type { PlayerState, CompletedScenarioRecord } from '@/game/engine/types';
import { addXp as levelAddXp } from '@/game/systems/LevelSystem';

interface PlayerStore {
  player: PlayerState | null;

  createPlayer: (name: string, phone: string, avatarId: 'male' | 'female') => void;
  loadPlayer: (player: PlayerState) => void;
  addXp: (amount: number) => void;
  addAchievement: (id: string) => void;
  addCoins: (amount: number) => void;
  spendCoin: () => boolean;
  addCompletedScenario: (record: CompletedScenarioRecord) => void;
  reset: () => void;
}

export const createPlayerStore = (storage?: PersistStorage<PlayerStore>) =>
  create<PlayerStore>()(
    persist(
      (set, get) => ({
        player: null,

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
          if (player.achievements.includes(id)) return; // deduplicate
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
          set({ player: null });
        },
      }),
      {
        name: 'sales-school-player',
        ...(storage ? { storage } : {}),
      },
    ),
  );

// Default store instance uses localStorage (available in browser)
export const usePlayerStore = createPlayerStore();
