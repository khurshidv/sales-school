'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '@/game/store/gameStore';
import { usePlayerStore } from '@/game/store/playerStore';
import { getScenario } from '@/game/data/scenarios';
import { getAvailableChoices } from '@/game/engine/ScenarioEngine';
import { GameEventBus } from '@/game/engine/EventBus';
import { calculateRating, getNearMiss } from '@/game/systems/ScoringSystem';
import { isGameOver, shouldLoseLife, shouldGainLife } from '@/game/systems/LivesSystem';
import { checkAchievements, type AchievementContext } from '@/game/systems/AchievementSystem';
import { getCoinsForOutcome, getCoinsForAchievement, getCoinsForFirstCompletion } from '@/game/systems/CoinSystem';
import { syncDayResults, syncAchievement } from '@/game/store/middleware/supabaseSync';
import { trackEvent } from '@/lib/game/analytics';
import type {
  Scenario,
  Day,
  Rating,
  DayOutcome,
  ChoiceOption,
  ChoiceNode,
  EndNode,
  GameEvent,
  DimensionScores,
} from '@/game/engine/types';

// --- Types ---

export type GameFlowState =
  | 'idle'
  | 'day_intro'
  | 'playing'
  | 'day_summary'
  | 'final_results';

export interface DayResults {
  dayIndex: number;
  score: number;
  targetScore: number;
  rating: Rating;
  dimensions: DimensionScores;
  nearMiss: { currentRating: Rating; nextRating: Rating; pointsNeeded: number } | null;
  unlockedAchievements: string[];
  coinsEarned: number;
  xpEarned: number;
  outcome: DayOutcome;
  nextDayTeaser?: { uz: string; ru: string };
  isLastDay: boolean;
}

export interface FinalResults {
  totalScore: number;
  dimensions: DimensionScores;
  dayRatings: Rating[];
  allAchievements: string[];
  strongestDimension: string;
  weakestDimension: string;
}

// --- Singleton EventBus ---

const eventBus = new GameEventBus();

// --- Hook ---

export function useGameEngine(scenarioId: string) {
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();

  const [flowState, setFlowState] = useState<GameFlowState>('idle');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [dayResults, setDayResults] = useState<DayResults | null>(null);
  const [finalResults, setFinalResults] = useState<FinalResults | null>(null);
  const [dayResultsHistory, setDayResultsHistory] = useState<DayResults[]>([]);

  // Track previous day state for transitions
  const previousDayStateRef = useRef<{ lives: number; flags: Record<string, boolean> } | null>(null);

  // Load scenario
  useEffect(() => {
    const s = getScenario(scenarioId);
    if (s) {
      setScenario(s);
      setCurrentDayIndex(0);
      setFlowState('day_intro');
    }
  }, [scenarioId]);

  // Detect end node → trigger day completion
  useEffect(() => {
    const node = gameStore.currentNode;
    if (!node || node.type !== 'end' || flowState !== 'playing') return;

    const session = gameStore.session;
    if (!session || !scenario) return;

    const endNode = node as EndNode;
    const day = scenario.days[currentDayIndex];
    const outcome = endNode.outcome;
    const score = session.score.total;
    const rating = calculateRating(score, day.targetScore);
    const nearMiss = getNearMiss(score, day.targetScore);
    const player = playerStore.player;

    // Check achievements
    const achievementContext: AchievementContext = {
      dayOutcome: outcome,
      dayRating: rating,
      dayIndex: currentDayIndex,
      isReplay: session.isReplay,
    };
    const newAchievements = player
      ? checkAchievements(session, player, achievementContext)
      : [];

    // Calculate coins
    let coinsEarned = getCoinsForOutcome(outcome, rating);
    coinsEarned += newAchievements.length * getCoinsForAchievement();

    // Check if first completion of this scenario
    const isFirstCompletion =
      currentDayIndex === scenario.days.length - 1 &&
      player &&
      !player.completedScenarios.some((r) => r.scenarioId === scenarioId);
    if (isFirstCompletion) {
      coinsEarned += getCoinsForFirstCompletion();
    }

    // XP from achievements
    const xpEarned = newAchievements.length * 25; // base XP per achievement

    // Apply rewards to player store
    if (player) {
      if (coinsEarned > 0) playerStore.addCoins(coinsEarned);
      if (xpEarned > 0) playerStore.addXp(xpEarned);
      for (const ach of newAchievements) {
        playerStore.addAchievement(ach);
      }
      playerStore.addCompletedScenario({
        scenarioId,
        dayIndex: currentDayIndex,
        score,
        rating,
        timeTaken: Date.now() - session.startTime,
        isReplay: session.isReplay,
        completedAt: Date.now(),
      });

      // Sync to Supabase (fire-and-forget)
      const dayId = scenario.days[currentDayIndex]?.id ?? `day-${currentDayIndex}`;
      syncDayResults(player.id, scenarioId, dayId, score, rating, Date.now() - session.startTime, session.choiceHistory);
      for (const ach of newAchievements) {
        syncAchievement(player.id, ach);
      }

      // Analytics
      const eventType = outcome === 'failure' ? 'day_failed' : 'day_completed';
      trackEvent(player.id, eventType, { score, rating, dayIndex: currentDayIndex }, scenarioId, dayId);
      if (currentDayIndex >= scenario.days.length - 1) {
        trackEvent(player.id, 'game_completed', { totalScore: score }, scenarioId);
      }
    }

    // Handle life changes + sound
    if (shouldLoseLife(rating)) {
      const newLives = session.lives - 1;
      eventBus.emit({ type: 'life_lost', remainingLives: newLives });
      eventBus.emit({ type: 'sound_requested', soundId: 'sfx_life_lost' });
      if (isGameOver(newLives)) {
        eventBus.emit({ type: 'game_over', dayIndex: currentDayIndex, totalScore: score });
      }
    }
    if (shouldGainLife(outcome)) {
      eventBus.emit({ type: 'life_gained', remainingLives: Math.min(session.lives + 1, session.maxLives) });
      eventBus.emit({ type: 'sound_requested', soundId: 'sfx_life_gained' });
    }

    // Sound for achievements
    for (const ach of newAchievements) {
      const soundId = ach === 'grandmaster' ? 'sfx_grandmaster' : 'sfx_achievement';
      eventBus.emit({ type: 'sound_requested', soundId });
    }

    // Emit events + day complete sound
    const daySound = outcome === 'failure' ? 'sfx_day_fail' : 'sfx_day_complete';
    eventBus.emit({ type: 'sound_requested', soundId: daySound });
    eventBus.emit({
      type: 'day_completed',
      dayIndex: currentDayIndex,
      score,
      rating,
      isHidden: outcome === 'hidden_ending',
    });

    if (nearMiss) {
      eventBus.emit({
        type: 'near_miss',
        currentRating: nearMiss.currentRating,
        nextRating: nearMiss.nextRating,
        pointsNeeded: nearMiss.pointsNeeded,
      });
    }

    const isLastDay = currentDayIndex >= scenario.days.length - 1;

    const results: DayResults = {
      dayIndex: currentDayIndex,
      score,
      targetScore: day.targetScore,
      rating,
      dimensions: { ...session.score.dimensions },
      nearMiss,
      unlockedAchievements: newAchievements,
      coinsEarned,
      xpEarned,
      outcome,
      nextDayTeaser: endNode.nextDayTeaser,
      isLastDay,
    };

    // Save state for next day transition
    previousDayStateRef.current = {
      lives: session.lives + (shouldGainLife(outcome) ? 1 : 0) - (shouldLoseLife(rating) ? 1 : 0),
      flags: { ...session.flags },
    };

    setDayResults(results);
    setDayResultsHistory((prev) => [...prev, results]);
    setFlowState('day_summary');
  }, [gameStore.currentNode, flowState, scenario, currentDayIndex, scenarioId, gameStore.session, playerStore]);

  // --- Actions ---

  const startDay = useCallback(
    (dayIndex: number) => {
      if (!scenario) return;
      const day = scenario.days[dayIndex];
      if (!day) return;

      setCurrentDayIndex(dayIndex);
      setDayResults(null);

      const prevState = dayIndex > 0 ? previousDayStateRef.current : undefined;
      gameStore.startDay(scenarioId, day, prevState ?? undefined);
      setFlowState('day_intro');
    },
    [scenario, scenarioId, gameStore],
  );

  const beginPlaying = useCallback(() => {
    setFlowState('playing');
  }, []);

  const advanceDialogue = useCallback(() => {
    if (flowState !== 'playing') return;
    const node = gameStore.currentNode;
    if (!node) return;
    if (node.type === 'dialogue' || node.type === 'day_intro') {
      gameStore.advanceDialogue();
    }
  }, [flowState, gameStore]);

  const selectChoice = useCallback(
    (index: number) => {
      if (flowState !== 'playing') return;
      eventBus.emit({ type: 'sound_requested', soundId: 'sfx_choice_select' });
      gameStore.selectChoice(index, playerStore.player ?? undefined);
    },
    [flowState, gameStore, playerStore.player],
  );

  const selectMultiChoices = useCallback(
    (indices: number[]) => {
      if (flowState !== 'playing') return;
      eventBus.emit({ type: 'sound_requested', soundId: 'sfx_choice_select' });
      gameStore.selectMultiChoices(indices, playerStore.player ?? undefined);
    },
    [flowState, gameStore, playerStore.player],
  );

  const timerExpired = useCallback(() => {
    eventBus.emit({ type: 'sound_requested', soundId: 'sfx_timer_expire' });
    gameStore.timerExpired();
  }, [gameStore]);

  const confirmNextDay = useCallback(() => {
    if (!scenario || !dayResults) return;

    if (dayResults.isLastDay) {
      // Calculate final results
      const allDims: DimensionScores = {
        empathy: 0, rapport: 0, timing: 0,
        expertise: 0, persuasion: 0, discovery: 0, opportunity: 0,
      };
      for (const dr of dayResultsHistory) {
        for (const key of Object.keys(allDims) as (keyof DimensionScores)[]) {
          allDims[key] += dr.dimensions[key];
        }
      }

      const dimEntries = Object.entries(allDims);
      const strongest = dimEntries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
      const weakest = dimEntries.reduce((a, b) => (b[1] < a[1] ? b : a))[0];

      setFinalResults({
        totalScore: dayResultsHistory.reduce((sum, dr) => sum + dr.score, 0),
        dimensions: allDims,
        dayRatings: dayResultsHistory.map((dr) => dr.rating),
        allAchievements: playerStore.player?.achievements ?? [],
        strongestDimension: strongest,
        weakestDimension: weakest,
      });
      setFlowState('final_results');
    } else {
      startDay(currentDayIndex + 1);
    }
  }, [scenario, dayResults, dayResultsHistory, currentDayIndex, startDay, playerStore.player]);

  const restartDay = useCallback(() => {
    if (!scenario) return;
    const day = scenario.days[currentDayIndex];
    gameStore.resetDay(day);
    setDayResults(null);
    setFlowState('day_intro');
  }, [scenario, currentDayIndex, gameStore]);

  // Available choices (filtered by conditions)
  const availableChoices = useMemo((): ChoiceOption[] => {
    const node = gameStore.currentNode;
    const session = gameStore.session;
    if (!node || node.type !== 'choice' || !session) return [];
    return getAvailableChoices(
      node as ChoiceNode,
      session,
      playerStore.player ?? undefined,
    );
  }, [gameStore.currentNode, gameStore.session, playerStore.player]);

  // Auto-start first day on mount
  useEffect(() => {
    if (scenario && flowState === 'idle') {
      // noop — flowState is already set to day_intro in the scenario load effect
    }
  }, [scenario, flowState]);

  // Start first day when scenario loads
  useEffect(() => {
    if (scenario && flowState === 'day_intro' && !gameStore.session) {
      startDay(0);
    }
  }, [scenario, flowState, gameStore.session, startDay]);

  return {
    // State
    flowState,
    currentNode: gameStore.currentNode,
    session: gameStore.session,
    player: playerStore.player,
    scenario,
    currentDayIndex,
    dayResults,
    finalResults,
    availableChoices,
    eventBus,

    // Actions
    beginPlaying,
    advanceDialogue,
    selectChoice,
    selectMultiChoices,
    timerExpired,
    confirmNextDay,
    restartDay,
    startDay,
  };
}
