// ============================================================
// Sales School Game Engine — Scenario Engine
// Core state machine: resolves nodes, applies effects,
// processes transitions. All functions are pure.
// ============================================================

import type {
  ScenarioNode,
  GameSessionState,
  PlayerState,
  Day,
  Effect,
  ChoiceNode,
  ChoiceOption,
  DimensionScores,
} from './types';
import { createEmptyDimensionScores, createInitialGameSession } from './types';
import { evaluateCondition } from './ConditionEvaluator';

// --- 1. resolveNode ---

export function resolveNode(nodeId: string, day: Day): ScenarioNode {
  const node = day.nodes[nodeId];
  if (!node) {
    throw new Error(`Node "${nodeId}" not found in day "${day.id}"`);
  }
  return node;
}

// --- 2. applyEffects ---

export function applyEffects(
  effects: Effect[],
  state: GameSessionState,
  playerState?: PlayerState,
): { state: GameSessionState; playerState?: PlayerState } {
  // Deep-clone state to guarantee immutability
  let newState: GameSessionState = {
    ...state,
    score: {
      total: state.score.total,
      dimensions: { ...state.score.dimensions },
    },
    flags: { ...state.flags },
    choiceHistory: [...state.choiceHistory],
  };

  let newPlayerState: PlayerState | undefined = playerState
    ? {
        ...playerState,
        achievements: [...playerState.achievements],
        completedScenarios: [...playerState.completedScenarios],
      }
    : undefined;

  for (const effect of effects) {
    switch (effect.type) {
      case 'add_score': {
        newState = {
          ...newState,
          score: {
            total: newState.score.total + effect.amount,
            dimensions: {
              ...newState.score.dimensions,
              [effect.dimension]:
                newState.score.dimensions[effect.dimension] + effect.amount,
            },
          },
        };
        break;
      }
      case 'lose_life': {
        newState = {
          ...newState,
          lives: Math.max(0, newState.lives - 1),
        };
        break;
      }
      case 'gain_life': {
        newState = {
          ...newState,
          lives: Math.min(newState.maxLives, newState.lives + 1),
        };
        break;
      }
      case 'set_flag': {
        newState = {
          ...newState,
          flags: { ...newState.flags, [effect.flag]: true },
        };
        break;
      }
      case 'unlock_achievement': {
        if (newPlayerState && !newPlayerState.achievements.includes(effect.id)) {
          newPlayerState = {
            ...newPlayerState,
            achievements: [...newPlayerState.achievements, effect.id],
          };
        }
        break;
      }
      case 'add_xp': {
        if (newPlayerState) {
          newPlayerState = {
            ...newPlayerState,
            totalXp: newPlayerState.totalXp + effect.amount,
          };
        }
        break;
      }
      case 'add_coins': {
        if (newPlayerState) {
          newPlayerState = {
            ...newPlayerState,
            coins: newPlayerState.coins + effect.amount,
          };
        }
        break;
      }
      case 'add_bonus': {
        // Store in state for now — no complex logic needed
        break;
      }
      case 'play_sound': {
        // No state change — UI handles this via EventBus
        break;
      }
    }
  }

  return { state: newState, playerState: newPlayerState };
}

// --- 3. processNode ---

export function processNode(
  node: ScenarioNode,
  state: GameSessionState,
  playerState?: PlayerState,
): { nextNodeId: string | null; state: GameSessionState; playerState?: PlayerState } {
  switch (node.type) {
    case 'condition_branch': {
      for (const branch of node.branches) {
        if (evaluateCondition(branch.condition, state, playerState)) {
          return { nextNodeId: branch.nextNodeId, state, playerState };
        }
      }
      return { nextNodeId: node.fallbackNodeId, state, playerState };
    }
    case 'score': {
      const result = applyEffects(node.effects, state, playerState);
      return {
        nextNodeId: node.nextNodeId,
        state: result.state,
        playerState: result.playerState,
      };
    }
    case 'timer_start': {
      return { nextNodeId: node.nextNodeId, state, playerState };
    }
    // Non-auto-advancing nodes: UI must call advanceDialogue or makeChoice
    case 'dialogue':
    case 'choice':
    case 'day_intro':
    case 'end':
    default:
      return { nextNodeId: null, state, playerState };
  }
}

// --- 4. makeChoice ---

export function makeChoice(
  choiceIndex: number,
  node: ChoiceNode,
  state: GameSessionState,
  playerState?: PlayerState,
): { nextNodeId: string; state: GameSessionState; playerState?: PlayerState } {
  if (choiceIndex < 0 || choiceIndex >= node.choices.length) {
    throw new Error(
      `Choice index ${choiceIndex} out of bounds for node "${node.id}" (${node.choices.length} choices)`,
    );
  }

  const choice = node.choices[choiceIndex];
  const { state: newState, playerState: newPlayerState } = applyEffects(
    choice.effects,
    state,
    playerState,
  );

  const stateWithHistory: GameSessionState = {
    ...newState,
    choiceHistory: [
      ...newState.choiceHistory,
      { nodeId: node.id, choiceIndex, timestamp: Date.now() },
    ],
  };

  return {
    nextNodeId: choice.nextNodeId,
    state: stateWithHistory,
    playerState: newPlayerState,
  };
}

// --- 5. makeMultiChoice ---

export function makeMultiChoice(
  choiceIndices: number[],
  node: ChoiceNode,
  state: GameSessionState,
  playerState?: PlayerState,
): { nextNodeId: string; state: GameSessionState; playerState?: PlayerState } {
  if (!node.multiSelect) {
    throw new Error(`Node "${node.id}" is not a multiSelect node`);
  }
  if (choiceIndices.length !== node.multiSelect.count) {
    throw new Error(
      `Expected ${node.multiSelect.count} choices, got ${choiceIndices.length}`,
    );
  }

  let currentState = state;
  let currentPlayerState = playerState;
  let lastNextNodeId = '';

  for (const idx of choiceIndices) {
    if (idx < 0 || idx >= node.choices.length) {
      throw new Error(
        `Choice index ${idx} out of bounds for node "${node.id}" (${node.choices.length} choices)`,
      );
    }

    const choice = node.choices[idx];
    const { state: newState, playerState: newPlayerState } = applyEffects(
      choice.effects,
      currentState,
      currentPlayerState,
    );

    currentState = {
      ...newState,
      choiceHistory: [
        ...newState.choiceHistory,
        { nodeId: node.id, choiceIndex: idx, timestamp: Date.now() },
      ],
    };
    currentPlayerState = newPlayerState;
    lastNextNodeId = choice.nextNodeId;
  }

  return {
    nextNodeId: lastNextNodeId,
    state: currentState,
    playerState: currentPlayerState,
  };
}

// --- 6. getAvailableChoices ---

export function getAvailableChoices(
  node: ChoiceNode,
  state: GameSessionState,
  playerState?: PlayerState,
): ChoiceOption[] {
  return node.choices.filter(
    (choice) =>
      !choice.condition || evaluateCondition(choice.condition, state, playerState),
  );
}

// --- 7. initDaySession ---

export function initDaySession(
  scenarioId: string,
  day: Day,
  previousState?: { lives: number; flags: Record<string, boolean> },
): GameSessionState {
  const session = createInitialGameSession(scenarioId, day.dayNumber - 1, day.rootNodeId);

  if (previousState) {
    // Inherit lives
    const lives = previousState.lives;

    // Inherit cross-day flags (keys matching /^d\d+_/)
    const crossDayFlags: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(previousState.flags)) {
      if (/^d\d+_/.test(key)) {
        crossDayFlags[key] = value;
      }
    }

    return {
      ...session,
      lives,
      flags: crossDayFlags,
    };
  }

  return session;
}
