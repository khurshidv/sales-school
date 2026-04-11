// ============================================================
// Sales School — Game Session Store (Zustand + Immer)
// Manages in-progress game session state.
// ============================================================

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GameSessionState, Day, PlayerState, ScenarioNode, ChoiceNode, NodeHistoryEntry } from '@/game/engine/types';
import { createInitialGameSession } from '@/game/engine/types';
import { resolveNode, processNode, applyEffects, makeChoice, makeMultiChoice } from '@/game/engine/ScenarioEngine';
import { evaluateCondition } from '@/game/engine/ConditionEvaluator';

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

      const rootNode = resolveNode(day.rootNodeId, day);

      set((state) => {
        state.session = initialSession;
        state.currentDay = day;
        state.currentNode = rootNode;
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

      let node = resolveNode(nextNodeId, currentDay);
      let updatedSession = { ...session, currentNodeId: nextNodeId, nodeHistory: history };

      // Auto-advance through condition_branch and score nodes
      while (node.type === 'condition_branch' || node.type === 'score') {
        const result = processNode(node, updatedSession);
        if (!result.nextNodeId) break;
        updatedSession = { ...result.state, currentNodeId: result.nextNodeId };
        node = resolveNode(result.nextNodeId, currentDay);
      }

      set((state) => {
        state.session = updatedSession;
        state.currentNode = node;
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
      const nextNode = resolveNode(result.nextNodeId, currentDay);

      let updatedSession = { ...result.state, currentNodeId: result.nextNodeId };
      let node = nextNode;

      // Auto-advance through condition_branch and score nodes
      while (node.type === 'condition_branch' || node.type === 'score') {
        const processed = processNode(node, updatedSession);
        if (!processed.nextNodeId) break;
        updatedSession = { ...processed.state, currentNodeId: processed.nextNodeId };
        node = resolveNode(processed.nextNodeId, currentDay);
      }

      set((state) => {
        state.session = updatedSession;
        state.currentNode = node;
      });
    },

    selectMultiChoices: (indices, playerState) => {
      const { session, currentDay, currentNode } = get();
      if (!session || !currentDay || !currentNode) return;
      if (currentNode.type !== 'choice') return;

      // See selectChoice: history is populated by advance() at the dialogue
      // before this choice; pushing the choice node itself breaks goBack().
      const result = makeMultiChoice(indices, currentNode as ChoiceNode, session, playerState);
      let updatedSession = { ...result.state, currentNodeId: result.nextNodeId };
      let node = resolveNode(result.nextNodeId, currentDay);

      // Auto-advance through condition_branch and score nodes
      while (node.type === 'condition_branch' || node.type === 'score') {
        const processed = processNode(node, updatedSession, playerState);
        if (!processed.nextNodeId) break;
        updatedSession = { ...processed.state, currentNodeId: processed.nextNodeId };
        node = resolveNode(processed.nextNodeId, currentDay);
      }

      set((state) => {
        state.session = updatedSession;
        state.currentNode = node;
      });
    },

    timerExpired: () => {
      const { session, currentDay, currentNode } = get();
      if (!session || !currentDay || !currentNode) return;

      // Choice nodes with expireNodeId
      if (currentNode.type === 'choice' && (currentNode as ChoiceNode).expireNodeId) {
        const expireNodeId = (currentNode as ChoiceNode).expireNodeId!;
        const expireNode = resolveNode(expireNodeId, currentDay);

        set((state) => {
          state.session!.currentNodeId = expireNodeId;
          state.currentNode = expireNode;
        });
      }
    },

    resetDay: (day) => {
      const { session } = get();
      if (!session) return;

      const lives = session.lives;
      const newSession = createInitialGameSession(session.scenarioId, day.dayNumber - 1, day.rootNodeId);
      const rootNode = resolveNode(day.rootNodeId, day);

      set((state) => {
        state.session = { ...newSession, lives };
        state.currentDay = day;
        state.currentNode = rootNode;
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
