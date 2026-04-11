'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '@/game/store/gameStore';
import { usePlayerStore } from '@/game/store/playerStore';
import { getScenario } from '@/game/data/scenarios';
import { getAvailableChoices } from '@/game/engine/ScenarioEngine';
import { GameEventBus } from '@/game/engine/EventBus';
import {
  calculateRating,
  getNearMiss,
  calculateWeightedTotal,
  getStrongestWeighted,
  getWeakestWeighted,
} from '@/game/systems/ScoringSystem';
import { isGameOver, shouldLoseLife, shouldGainLife } from '@/game/systems/LivesSystem';
import { checkAchievements, type AchievementContext } from '@/game/systems/AchievementSystem';
import { getCoinsForOutcome, getCoinsForAchievement, getCoinsForFirstCompletion } from '@/game/systems/CoinSystem';
import { syncDayResults, syncAchievement } from '@/game/store/middleware/supabaseSync';
import { trackEvent } from '@/lib/game/analytics';
import type {
  Scenario,
  Rating,
  DayOutcome,
  ChoiceOption,
  ChoiceNode,
  EndNode,
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
  /** Snapshot флагов сессии на момент end-ноды — нужен для нарратива
   * в DaySummary (e.g. knows_anniversary, addressed_both). */
  flags: Record<string, boolean>;
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
  // ---- Zustand slice selectors (NOT whole-store subscriptions) ----
  //
  // Subscribing to the whole store (`const s = useGameStore()`) re-runs
  // this 400-line hook on every mutation (combo +1, score +10, flag set).
  // Slice selectors only re-run the hook when the specific field changes.
  // Action functions are stable references in zustand, so selecting them
  // individually does NOT cause extra re-renders.
  const currentNode = useGameStore((s) => s.currentNode);
  const session = useGameStore((s) => s.session);
  const gsStartDay = useGameStore((s) => s.startDay);
  const gsAdvanceDialogue = useGameStore((s) => s.advanceDialogue);
  const gsSelectChoice = useGameStore((s) => s.selectChoice);
  const gsSelectMultiChoices = useGameStore((s) => s.selectMultiChoices);
  const gsTimerExpired = useGameStore((s) => s.timerExpired);
  const gsPauseTimer = useGameStore((s) => s.pauseTimer);
  const gsResumeTimer = useGameStore((s) => s.resumeTimer);
  const gsResetDay = useGameStore((s) => s.resetDay);
  const gsGoBack = useGameStore((s) => s.goBack);
  const gsCanGoBack = useGameStore((s) => s.canGoBack);

  const player = usePlayerStore((s) => s.player);

  const [flowState, setFlowState] = useState<GameFlowState>('idle');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [dayResults, setDayResults] = useState<DayResults | null>(null);
  const [finalResults, setFinalResults] = useState<FinalResults | null>(null);
  const [dayResultsHistory, setDayResultsHistory] = useState<DayResults[]>([]);

  // Track previous day state for transitions
  const previousDayStateRef = useRef<{ lives: number; flags: Record<string, boolean> } | null>(null);
  // Guard: prevent end-node effect from firing multiple times
  const endNodeProcessedRef = useRef<string | null>(null);
  // Guard: prevent double-click on confirmNextDay
  const transitioningRef = useRef(false);

  // Load scenario
  useEffect(() => {
    const s = getScenario(scenarioId);
    if (s) {
      setScenario(s);
      setCurrentDayIndex(0);
      setFlowState('day_intro');
    }
  }, [scenarioId]);

  // Detect end node → trigger day completion.
  //
  // Deps are intentionally narrow: this effect should fire only when the
  // scenario graph advances into an end node, not on every player stat
  // mutation. Player actions are read imperatively via getState() inside
  // the body to avoid re-subscribing.
  useEffect(() => {
    if (!currentNode || currentNode.type !== 'end' || flowState !== 'playing') return;
    // Guard: don't process same end node twice
    if (endNodeProcessedRef.current === currentNode.id) return;
    endNodeProcessedRef.current = currentNode.id;

    if (!session || !scenario) return;

    const endNode = currentNode as EndNode;
    const day = scenario.days[currentDayIndex];
    const outcome = endNode.outcome;
    // Используем взвешенную сумму, а не raw total сессии. Raw total
    // остаётся у HUD/condition_branch как есть; взвешенный показатель
    // честнее отражает качество продажных решений и соответствует
    // новым targetScore-ам (Day 1 = 55).
    const score = Math.round(calculateWeightedTotal(session.score.dimensions));
    const rating = calculateRating(score, day.targetScore);
    const nearMiss = getNearMiss(score, day.targetScore);
    const currentPlayer = usePlayerStore.getState().player;
    const playerActions = usePlayerStore.getState();

    // Check achievements
    const achievementContext: AchievementContext = {
      dayOutcome: outcome,
      dayRating: rating,
      dayIndex: currentDayIndex,
      isReplay: session.isReplay,
    };
    const newAchievements = currentPlayer
      ? checkAchievements(session, currentPlayer, achievementContext)
      : [];

    // Calculate coins
    let coinsEarned = getCoinsForOutcome(outcome, rating);
    coinsEarned += newAchievements.length * getCoinsForAchievement();

    // Check if first completion of this scenario
    const isFirstCompletion =
      currentDayIndex === scenario.days.length - 1 &&
      currentPlayer &&
      !currentPlayer.completedScenarios.some((r) => r.scenarioId === scenarioId);
    if (isFirstCompletion) {
      coinsEarned += getCoinsForFirstCompletion();
    }

    // XP from achievements
    const xpEarned = newAchievements.length * 25; // base XP per achievement

    // Apply rewards to player store
    if (currentPlayer) {
      if (coinsEarned > 0) playerActions.addCoins(coinsEarned);
      if (xpEarned > 0) playerActions.addXp(xpEarned);
      for (const ach of newAchievements) {
        playerActions.addAchievement(ach);
      }
      playerActions.addCompletedScenario({
        scenarioId,
        dayIndex: currentDayIndex,
        score,
        rating,
        timeTaken: Date.now() - session.startTime,
        isReplay: session.isReplay,
        completedAt: Date.now(),
      });

      // Sync to Supabase (with retry for reliability)
      const dayId = scenario.days[currentDayIndex]?.id ?? `day-${currentDayIndex}`;
      syncDayResults(currentPlayer.id, scenarioId, dayId, score, rating, Date.now() - session.startTime, session.choiceHistory).catch(() => {});
      for (const ach of newAchievements) {
        syncAchievement(currentPlayer.id, ach).catch(() => {});
      }

      // Analytics
      const eventType = outcome === 'failure' ? 'day_failed' : 'day_completed';
      trackEvent(currentPlayer.id, eventType, { score, rating, dayIndex: currentDayIndex }, scenarioId, dayId);
      if (currentDayIndex >= scenario.days.length - 1) {
        trackEvent(currentPlayer.id, 'game_completed', { totalScore: score }, scenarioId);
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
      flags: { ...session.flags },
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
  }, [currentNode, flowState, scenario, currentDayIndex, scenarioId, session]);

  // --- Actions ---

  const startDay = useCallback(
    (dayIndex: number) => {
      if (!scenario) return;
      const day = scenario.days[dayIndex];
      if (!day) return;

      setCurrentDayIndex(dayIndex);
      setDayResults(null);
      endNodeProcessedRef.current = null;
      transitioningRef.current = false;

      const prevState = dayIndex > 0 ? previousDayStateRef.current : undefined;
      gsStartDay(scenarioId, day, prevState ?? undefined);
      setFlowState('day_intro');
    },
    [scenario, scenarioId, gsStartDay],
  );

  const beginPlaying = useCallback(() => {
    setFlowState('playing');
  }, []);

  const advanceDialogue = useCallback(() => {
    if (flowState !== 'playing') return;
    if (!currentNode) return;
    if (currentNode.type === 'dialogue' || currentNode.type === 'day_intro') {
      gsAdvanceDialogue();
    }
  }, [flowState, currentNode, gsAdvanceDialogue]);

  const selectChoice = useCallback(
    (index: number) => {
      if (flowState !== 'playing') return;
      eventBus.emit({ type: 'sound_requested', soundId: 'sfx_choice_select' });
      gsSelectChoice(index, player ?? undefined);
    },
    [flowState, gsSelectChoice, player],
  );

  const selectMultiChoices = useCallback(
    (indices: number[]) => {
      if (flowState !== 'playing') return;
      eventBus.emit({ type: 'sound_requested', soundId: 'sfx_choice_select' });
      gsSelectMultiChoices(indices, player ?? undefined);
    },
    [flowState, gsSelectMultiChoices, player],
  );

  const timerExpired = useCallback(() => {
    eventBus.emit({ type: 'sound_requested', soundId: 'sfx_timer_expire' });
    gsTimerExpired();
  }, [gsTimerExpired]);

  const pauseTimer = useCallback(() => {
    gsPauseTimer();
  }, [gsPauseTimer]);

  const resumeTimer = useCallback(() => {
    gsResumeTimer();
  }, [gsResumeTimer]);

  const confirmNextDay = useCallback(() => {
    if (!scenario || !dayResults || transitioningRef.current) return;
    transitioningRef.current = true;

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

      // Взвешенные функции дают более точную оценку: «сильная сторона»
      // теперь отражает вклад в воронку продаж, а не просто абсолютные очки.
      const strongest = getStrongestWeighted(allDims);
      const weakest = getWeakestWeighted(allDims);

      setFinalResults({
        totalScore: dayResultsHistory.reduce((sum, dr) => sum + dr.score, 0),
        dimensions: allDims,
        dayRatings: dayResultsHistory.map((dr) => dr.rating),
        allAchievements: player?.achievements ?? [],
        strongestDimension: strongest,
        weakestDimension: weakest,
      });
      setFlowState('final_results');
    } else {
      startDay(currentDayIndex + 1);
    }
  }, [scenario, dayResults, dayResultsHistory, currentDayIndex, startDay, player]);

  const goBack = useCallback(() => {
    if (flowState !== 'playing') return;
    gsGoBack();
  }, [flowState, gsGoBack]);

  // canGoBack is derived: it depends on session state which re-renders the
  // hook, and gsCanGoBack is a stable ref that inspects the latest state.
  const canGoBack = flowState === 'playing' && gsCanGoBack();

  const restartDay = useCallback(() => {
    if (!scenario) return;
    const day = scenario.days[currentDayIndex];
    gsResetDay(day);
    setDayResults(null);
    // Remove last entry from history (the failed day we're restarting)
    setDayResultsHistory((prev) => prev.filter((dr) => dr.dayIndex !== currentDayIndex));
    endNodeProcessedRef.current = null;
    transitioningRef.current = false;
    setFlowState('day_intro');
  }, [scenario, currentDayIndex, gsResetDay]);

  // Available choices (filtered by conditions)
  const availableChoices = useMemo((): ChoiceOption[] => {
    if (!currentNode || currentNode.type !== 'choice' || !session) return [];
    return getAvailableChoices(
      currentNode as ChoiceNode,
      session,
      player ?? undefined,
    );
  }, [currentNode, session, player]);

  // Start first day when scenario loads
  useEffect(() => {
    if (scenario && flowState === 'day_intro' && !session) {
      startDay(0);
    }
  }, [scenario, flowState, session, startDay]);

  // ---- Memoized return object ----
  //
  // Without useMemo, every render of this hook produces a new object
  // reference, defeating React.memo on any consumer (DialogueBox,
  // ChoicePanel, GameHUD). With useMemo + narrow deps, consumers only
  // re-render when a field they actually use changes.
  return useMemo(
    () => ({
      // State
      flowState,
      currentNode,
      session,
      player,
      scenario,
      currentDayIndex,
      dayResults,
      finalResults,
      availableChoices,
      eventBus,

      // Actions
      beginPlaying,
      advanceDialogue,
      goBack,
      canGoBack,
      selectChoice,
      selectMultiChoices,
      timerExpired,
      pauseTimer,
      resumeTimer,
      confirmNextDay,
      restartDay,
      startDay,
    }),
    [
      flowState,
      currentNode,
      session,
      player,
      scenario,
      currentDayIndex,
      dayResults,
      finalResults,
      availableChoices,
      beginPlaying,
      advanceDialogue,
      goBack,
      canGoBack,
      selectChoice,
      selectMultiChoices,
      timerExpired,
      pauseTimer,
      resumeTimer,
      confirmNextDay,
      restartDay,
      startDay,
    ],
  );
}
