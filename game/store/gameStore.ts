// ============================================================
// Sales School — Game Session Store (Zustand + Immer)
// Manages in-progress game session state.
// ============================================================

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GameSessionState, Day, PlayerState, ScenarioNode, ChoiceNode, NodeHistoryEntry } from '@/game/engine/types';
import { createInitialGameSession } from '@/game/engine/types';
import { resolveNode, processNode, makeChoice, makeMultiChoice } from '@/game/engine/ScenarioEngine';
import {
  startTimer,
  pauseTimer as pauseTimerFn,
  resumeTimer as resumeTimerFn,
} from '@/game/systems/TimerSystem';

interface GameStore {
  session: GameSessionState | null;
  currentDay: Day | null;
  currentNode: ScenarioNode | null;

  // Actions
  startDay: (scenarioId: string, day: Day, previousState?: { lives: number; flags: Record<string, boolean> }) => void;
  advanceDialogue: () => void;
  selectChoice: (choiceIndex: number, playerState?: PlayerState) => void;
  selectMultiChoices: (indices: number[], playerState?: PlayerState) => void;
  timerExpired: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetDay: (day: Day) => void;
  goBack: () => void;
  canGoBack: () => boolean;
}

const MAX_HISTORY = 50;

function createHistoryEntry(session: GameSessionState): NodeHistoryEntry {
  return {
    nodeId: session.currentNodeId,
    sessionSnapshot: {
      score: { total: session.score.total, dimensions: { ...session.score.dimensions } },
      flags: { ...session.flags },
      lives: session.lives,
      comboCount: session.comboCount,
    },
  };
}

/**
 * Resolve a node and perform the work common to every transition:
 *
 *   1. Auto-advance through any `condition_branch` / `score` nodes until
 *      we land on a user-visible node (dialogue / choice / day_intro / end).
 *   2. Start `session.timerState` if we land on a timed choice; clear it
 *      otherwise.
 *
 * Why (2) lives here: `timerState` on the session is what `useTimer()`
 * subscribes to, which in turn drives the visible progress bar in
 * `ChoicePanel`. Before this helper existed, nothing ever populated
 * `timerState`, so all six timed choices across the scenarios rendered
 * without a timer bar and never expired. Centralising timer lifecycle
 * here guarantees every transition into a timed choice starts the clock
 * and every transition out of one clears it — impossible to forget in
 * only one of the five call sites.
 */
function enterNode(
  nodeId: string,
  day: Day,
  session: GameSessionState,
  playerState?: PlayerState,
  now: number = Date.now(),
): { node: ScenarioNode; session: GameSessionState } {
  let node = resolveNode(nodeId, day);
  let currentSession: GameSessionState = { ...session, currentNodeId: nodeId };

  // Auto-advance through condition_branch and score nodes
  while (node.type === 'condition_branch' || node.type === 'score') {
    const result = processNode(node, currentSession, playerState);
    if (!result.nextNodeId) break;
    currentSession = { ...result.state, currentNodeId: result.nextNodeId };
    node = resolveNode(result.nextNodeId, day);
  }

  // Start or clear timer based on where we landed.
  if (node.type === 'choice' && node.timeLimit) {
    currentSession = {
      ...currentSession,
      timerState: startTimer(node.timeLimit, now),
    };
  } else if (currentSession.timerState !== null) {
    currentSession = { ...currentSession, timerState: null };
  }

  return { node, session: currentSession };
}

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    session: null,
    currentDay: null,
    currentNode: null,

    startDay: (scenarioId, day, previousState) => {
      const session = createInitialGameSession(scenarioId, day.dayNumber - 1, day.rootNodeId);

      let initialSession = session;
      if (previousState) {
        // Inherit lives and cross-day flags
        const crossDayFlags: Record<string, boolean> = {};
        for (const [key, value] of Object.entries(previousState.flags)) {
          if (/^d\d+_/.test(key)) {
            crossDayFlags[key] = value;
          }
        }
        initialSession = {
          ...session,
          lives: previousState.lives,
          flags: crossDayFlags,
        };
      }

      const entered = enterNode(day.rootNodeId, day, initialSession);

      set((state) => {
        state.session = entered.session;
        state.currentDay = day;
        state.currentNode = entered.node;
      });
    },

    advanceDialogue: () => {
      const { session, currentDay, currentNode } = get();
      if (!session || !currentDay || !currentNode) return;

      let nextNodeId: string | null = null;

      // For dialogue / day_intro nodes, follow their nextNodeId
      if (currentNode.type === 'dialogue') {
        nextNodeId = currentNode.nextNodeId;
      } else if (currentNode.type === 'day_intro') {
        nextNodeId = currentNode.nextNodeId;
      } else {
        return; // Cannot advance non-dialogue nodes this way
      }

      if (!nextNodeId) return;

      // Push current position to history before advancing
      const historyEntry = createHistoryEntry(session);
      const history = [...session.nodeHistory, historyEntry].slice(-MAX_HISTORY);
      const sessionWithHistory: GameSessionState = { ...session, nodeHistory: history };

      const entered = enterNode(nextNodeId, currentDay, sessionWithHistory);

      set((state) => {
        state.session = entered.session;
        state.currentNode = entered.node;
      });
    },

    selectChoice: (choiceIndex, playerState) => {
      const { session, currentDay, currentNode } = get();
      if (!session || !currentDay || !currentNode) return;
      if (currentNode.type !== 'choice') return;

      // Do not push the choice node to history: the dialogue that led into
      // this choice was already pushed by advance(), so goBack() restores to
      // the pre-choice state correctly. Pushing the choice itself would leave
      // a non-dialogue entry on top of the stack, which goBack() silently
      // refuses to restore — making the "Шаг назад" button appear to do nothing.
      const result = makeChoice(choiceIndex, currentNode as ChoiceNode, session, playerState);
      const entered = enterNode(result.nextNodeId, currentDay, result.state, playerState);

      set((state) => {
        state.session = entered.session;
        state.currentNode = entered.node;
      });
    },

    selectMultiChoices: (indices, playerState) => {
      const { session, currentDay, currentNode } = get();
      if (!session || !currentDay || !currentNode) return;
      if (currentNode.type !== 'choice') return;

      // See selectChoice: history is populated by advance() at the dialogue
      // before this choice; pushing the choice node itself breaks goBack().
      const result = makeMultiChoice(indices, currentNode as ChoiceNode, session, playerState);
      const entered = enterNode(result.nextNodeId, currentDay, result.state, playerState);

      set((state) => {
        state.session = entered.session;
        state.currentNode = entered.node;
      });
    },

    timerExpired: () => {
      const { session, currentDay, currentNode } = get();
      if (!session || !currentDay || !currentNode) return;

      // Choice nodes with expireNodeId
      if (currentNode.type === 'choice' && (currentNode as ChoiceNode).expireNodeId) {
        const expireNodeId = (currentNode as ChoiceNode).expireNodeId!;
        const entered = enterNode(expireNodeId, currentDay, session);

        set((state) => {
          state.session = entered.session;
          state.currentNode = entered.node;
        });
      }
    },

    pauseTimer: () => {
      set((state) => {
        if (state.session?.timerState) {
          state.session.timerState = pauseTimerFn(state.session.timerState, Date.now());
        }
      });
    },

    resumeTimer: () => {
      set((state) => {
        if (state.session?.timerState) {
          state.session.timerState = resumeTimerFn(state.session.timerState, Date.now());
        }
      });
    },

    resetDay: (day) => {
      const { session } = get();
      if (!session) return;

      const lives = session.lives;
      const newSession = createInitialGameSession(session.scenarioId, day.dayNumber - 1, day.rootNodeId);
      const entered = enterNode(day.rootNodeId, day, { ...newSession, lives });

      set((state) => {
        state.session = entered.session;
        state.currentDay = day;
        state.currentNode = entered.node;
      });
    },

    goBack: () => {
      const { session, currentDay } = get();
      if (!session || !currentDay || session.nodeHistory.length === 0) return;

      const history = [...session.nodeHistory];
      const previous = history.pop()!;
      const node = resolveNode(previous.nodeId, currentDay);

      // Only allow going back to dialogue/day_intro nodes
      if (node.type !== 'dialogue' && node.type !== 'day_intro') return;

      set((state) => {
        state.session = {
          ...state.session!,
          currentNodeId: previous.nodeId,
          score: previous.sessionSnapshot.score,
          flags: previous.sessionSnapshot.flags,
          lives: previous.sessionSnapshot.lives,
          comboCount: previous.sessionSnapshot.comboCount,
          nodeHistory: history,
          // history entries are always dialogue/day_intro, so going back
          // can never land on a timed choice — clear any residual timer.
          timerState: null,
        };
        state.currentNode = node;
      });
    },

    canGoBack: () => {
      const { session, currentNode } = get();
      if (!session || !currentNode) return false;
      // Can go back only from dialogue/day_intro, not from choice nodes
      if (currentNode.type === 'choice') return false;
      return session.nodeHistory.length > 0;
    },
  })),
);
