import { describe, it, expect, beforeEach } from 'vitest';
import { createPlayerStore } from '../playerStore';
import type { PlayerState, CompletedScenarioRecord } from '@/game/engine/types';
import type { PersistStorage } from 'zustand/middleware';

// In-memory storage for tests (avoids localStorage dependency)
const createTestStorage = (): PersistStorage<any> => {
  let store: Record<string, string> = {};
  return {
    getItem: (name: string) => {
      const value = store[name];
      return value ? JSON.parse(value) : null;
    },
    setItem: (name: string, value: any) => {
      store[name] = JSON.stringify(value);
    },
    removeItem: (name: string) => { delete store[name]; },
  };
};

describe('playerStore', () => {
  let useStore: ReturnType<typeof createPlayerStore>;

  beforeEach(() => {
    useStore = createPlayerStore(createTestStorage());
  });

  it('player is null initially', () => {
    expect(useStore.getState().player).toBeNull();
  });

  it('createPlayer sets correct defaults (level 1, 0 xp, 0 coins)', () => {
    useStore.getState().createPlayer('Ali', '+998901234567', 'male');

    const { player } = useStore.getState();
    expect(player).not.toBeNull();
    expect(player!.displayName).toBe('Ali');
    expect(player!.phone).toBe('+998901234567');
    expect(player!.avatarId).toBe('male');
    expect(player!.level).toBe(1);
    expect(player!.totalXp).toBe(0);
    expect(player!.coins).toBe(0);
    expect(player!.achievements).toEqual([]);
    expect(player!.completedScenarios).toEqual([]);
  });

  it('loadPlayer restores full state', () => {
    const fullPlayer: PlayerState = {
      id: 'test-id',
      phone: '+998900000000',
      displayName: 'Test',
      avatarId: 'female',
      level: 5,
      totalXp: 2000,
      totalScore: 500,
      coins: 10,
      achievements: ['first_sale'],
      completedScenarios: [],
    };

    useStore.getState().loadPlayer(fullPlayer);

    const { player } = useStore.getState();
    expect(player).toEqual(fullPlayer);
  });

  it('addXp updates totalXp and recalculates level', () => {
    useStore.getState().createPlayer('Ali', '+998901234567', 'male');

    // Level 1 requires 100 XP, so adding 150 should level up to 2
    useStore.getState().addXp(150);

    const { player } = useStore.getState();
    expect(player!.totalXp).toBe(150);
    expect(player!.level).toBe(2);
  });

  it('addAchievement adds new achievement', () => {
    useStore.getState().createPlayer('Ali', '+998901234567', 'male');
    useStore.getState().addAchievement('first_sale');

    const { player } = useStore.getState();
    expect(player!.achievements).toContain('first_sale');
    expect(player!.achievements).toHaveLength(1);
  });

  it('addAchievement deduplicates', () => {
    useStore.getState().createPlayer('Ali', '+998901234567', 'male');
    useStore.getState().addAchievement('first_sale');
    useStore.getState().addAchievement('first_sale');

    const { player } = useStore.getState();
    expect(player!.achievements).toHaveLength(1);
  });

  it('addCoins increases coins', () => {
    useStore.getState().createPlayer('Ali', '+998901234567', 'male');
    useStore.getState().addCoins(5);

    expect(useStore.getState().player!.coins).toBe(5);

    useStore.getState().addCoins(3);
    expect(useStore.getState().player!.coins).toBe(8);
  });

  it('spendCoin decreases by 1, returns true', () => {
    useStore.getState().createPlayer('Ali', '+998901234567', 'male');
    useStore.getState().addCoins(3);

    const result = useStore.getState().spendCoin();

    expect(result).toBe(true);
    expect(useStore.getState().player!.coins).toBe(2);
  });

  it('spendCoin with 0 coins returns false', () => {
    useStore.getState().createPlayer('Ali', '+998901234567', 'male');

    const result = useStore.getState().spendCoin();

    expect(result).toBe(false);
    expect(useStore.getState().player!.coins).toBe(0);
  });

  it('addCompletedScenario appends record', () => {
    useStore.getState().createPlayer('Ali', '+998901234567', 'male');

    const record: CompletedScenarioRecord = {
      scenarioId: 'car-dealership',
      dayIndex: 0,
      score: 85,
      rating: 'A',
      timeTaken: 120000,
      isReplay: false,
      completedAt: Date.now(),
    };

    useStore.getState().addCompletedScenario(record);

    const { player } = useStore.getState();
    expect(player!.completedScenarios).toHaveLength(1);
    expect(player!.completedScenarios[0]).toEqual(record);

    // Add another
    const record2: CompletedScenarioRecord = {
      ...record,
      dayIndex: 1,
      score: 70,
      rating: 'B',
    };
    useStore.getState().addCompletedScenario(record2);
    expect(useStore.getState().player!.completedScenarios).toHaveLength(2);
  });
});
