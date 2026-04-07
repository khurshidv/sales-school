// ============================================================
// Sales School Game Engine — Scenario Validator
// Validates scenario graphs: structural integrity, reachability,
// balance, and type consistency. Zero runtime dependencies on React.
// ============================================================

import type {
  Day,
  Scenario,
  ScenarioNode,
  ChoiceNode,
  DialogueNode,
  ConditionBranchNode,
  ScoreNode,
  TimerStartNode,
  DayIntroNode,
  EndNode,
  Effect,
} from './types';
import { SCORE_DIMENSIONS } from './types';

// --- Public types ---

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// --- Helpers: extract outgoing node references ---

/** Returns all nodeIds that a given node references (next, fallback, branches, choices, expire). */
function getOutgoingIds(node: ScenarioNode): string[] {
  const ids: string[] = [];
  switch (node.type) {
    case 'dialogue':
      ids.push(node.nextNodeId);
      break;
    case 'day_intro':
      ids.push(node.nextNodeId);
      break;
    case 'score':
      ids.push(node.nextNodeId);
      break;
    case 'timer_start':
      ids.push(node.nextNodeId);
      ids.push(node.expireNodeId);
      break;
    case 'choice':
      for (const choice of node.choices) {
        ids.push(choice.nextNodeId);
      }
      if (node.expireNodeId) {
        ids.push(node.expireNodeId);
      }
      break;
    case 'condition_branch':
      ids.push(node.fallbackNodeId);
      for (const branch of node.branches) {
        ids.push(branch.nextNodeId);
      }
      break;
    case 'end':
      // Terminal — no outgoing
      break;
  }
  return ids;
}

/** Extracts all effects from a node (including choice effects and end effects). */
function getNodeEffects(node: ScenarioNode): Effect[] {
  switch (node.type) {
    case 'dialogue':
      return node.effects ?? [];
    case 'score':
      return node.effects;
    case 'end':
      return node.effects;
    case 'choice':
      // Choice effects are per-option, handled separately in path analysis
      return [];
    default:
      return [];
  }
}

/** Sum add_score amounts from an array of effects. */
function sumScore(effects: Effect[]): number {
  let total = 0;
  for (const e of effects) {
    if (e.type === 'add_score') {
      total += e.amount;
    }
  }
  return total;
}

// --- Structural validation ---

function checkReferences(day: Day, errors: string[]): void {
  const nodeIds = new Set(Object.keys(day.nodes));

  // 1. rootNodeId exists
  if (!nodeIds.has(day.rootNodeId)) {
    errors.push(
      `rootNodeId "${day.rootNodeId}" does not exist in day "${day.id}" nodes`,
    );
  }

  // 2-6. Every outgoing reference exists
  for (const [nodeId, node] of Object.entries(day.nodes)) {
    const outgoing = getOutgoingIds(node);
    for (const targetId of outgoing) {
      if (!nodeIds.has(targetId)) {
        errors.push(
          `Node "${nodeId}" (type: ${node.type}) references "${targetId}" which does not exist in day "${day.id}"`,
        );
      }
    }
  }
}

// --- Reachability (BFS from root) ---

function findReachableNodes(day: Day): Set<string> {
  const reachable = new Set<string>();
  const nodeMap = day.nodes;
  if (!nodeMap[day.rootNodeId]) return reachable;

  const queue: string[] = [day.rootNodeId];
  reachable.add(day.rootNodeId);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const node = nodeMap[currentId];
    if (!node) continue;

    const outgoing = getOutgoingIds(node);
    for (const nextId of outgoing) {
      if (!reachable.has(nextId) && nodeMap[nextId]) {
        reachable.add(nextId);
        queue.push(nextId);
      }
    }
  }

  return reachable;
}

function checkReachability(day: Day, warnings: string[]): void {
  const reachable = findReachableNodes(day);
  const allIds = Object.keys(day.nodes);
  for (const nodeId of allIds) {
    if (!reachable.has(nodeId)) {
      warnings.push(
        `Node "${nodeId}" in day "${day.id}" is unreachable from rootNodeId (orphan)`,
      );
    }
  }
}

// --- Cycle detection + path-to-end check (DFS) ---

function checkPathsReachEnd(day: Day, errors: string[]): void {
  const nodeMap = day.nodes;
  if (!nodeMap[day.rootNodeId]) return;

  // Track: does every path from root reach an end node?
  // We do a DFS. If we revisit a node on the current path (cycle),
  // and no branch of that path reached an end, it's an error.

  let allPathsReachEnd = true;

  function dfs(nodeId: string, visited: Set<string>): boolean {
    const node = nodeMap[nodeId];
    if (!node) return false; // broken reference, caught elsewhere

    if (node.type === 'end') return true;

    if (visited.has(nodeId)) {
      // Cycle detected on this path
      return false;
    }

    visited.add(nodeId);

    const outgoing = getOutgoingIds(node);
    if (outgoing.length === 0) {
      // Non-end node with no outgoing = dead end
      visited.delete(nodeId);
      return false;
    }

    // For this node, every outgoing branch must be able to reach end.
    // But for choice nodes, at least we need each choice to reach end.
    let allBranchesReachEnd = true;
    for (const nextId of outgoing) {
      const branchReachesEnd = dfs(nextId, visited);
      if (!branchReachesEnd) {
        allBranchesReachEnd = false;
      }
    }

    visited.delete(nodeId);
    return allBranchesReachEnd;
  }

  const reached = dfs(day.rootNodeId, new Set());
  if (!reached) {
    errors.push(
      `Cycle detected or dead-end path in day "${day.id}": not every path from rootNodeId reaches an end node`,
    );
  }
}

// --- Best-path score analysis (for S-rating check) ---

function computeBestPathScore(day: Day): number {
  const nodeMap = day.nodes;
  if (!nodeMap[day.rootNodeId]) return 0;

  // Memoized DFS: returns the maximum score achievable from a given node
  const memo = new Map<string, number>();

  function bestScore(nodeId: string, visited: Set<string>): number {
    const node = nodeMap[nodeId];
    if (!node) return 0;
    if (node.type === 'end') return sumScore(node.effects);
    if (visited.has(nodeId)) return 0; // cycle → 0

    if (memo.has(nodeId) && !visited.has(nodeId)) {
      return memo.get(nodeId)!;
    }

    visited.add(nodeId);

    let score = sumScore(getNodeEffects(node));

    if (node.type === 'choice') {
      // Pick the best choice
      let bestChoice = -Infinity;
      for (const choice of node.choices) {
        const choiceScore =
          sumScore(choice.effects) +
          bestScore(choice.nextNodeId, visited);
        if (choiceScore > bestChoice) {
          bestChoice = choiceScore;
        }
      }
      // Also consider expire path if present
      if (node.expireNodeId && nodeMap[node.expireNodeId]) {
        const expireScore = bestScore(node.expireNodeId, visited);
        if (expireScore > bestChoice) {
          bestChoice = expireScore;
        }
      }
      score += bestChoice === -Infinity ? 0 : bestChoice;
    } else if (node.type === 'condition_branch') {
      // Pick the best branch
      let bestBranch = -Infinity;
      for (const branch of node.branches) {
        const branchScore = bestScore(branch.nextNodeId, visited);
        if (branchScore > bestBranch) {
          bestBranch = branchScore;
        }
      }
      const fallbackScore = bestScore(node.fallbackNodeId, visited);
      if (fallbackScore > bestBranch) {
        bestBranch = fallbackScore;
      }
      score += bestBranch === -Infinity ? 0 : bestBranch;
    } else {
      // Linear nodes: dialogue, day_intro, score, timer_start
      const outgoing = getOutgoingIds(node);
      let bestNext = 0;
      for (const nextId of outgoing) {
        const nextScore = bestScore(nextId, visited);
        if (nextScore > bestNext) bestNext = nextScore;
      }
      score += bestNext;
    }

    visited.delete(nodeId);
    memo.set(nodeId, score);
    return score;
  }

  return bestScore(day.rootNodeId, new Set());
}

function checkBalance(day: Day, warnings: string[]): void {
  const best = computeBestPathScore(day);
  const threshold = day.targetScore * 0.9;
  if (best < threshold) {
    warnings.push(
      `S-rating not achievable in day "${day.id}": best path score (${best}) < 90% of targetScore (${day.targetScore}). Need at least ${threshold}.`,
    );
  }
}

// --- Type consistency checks ---

function checkTypeConsistency(day: Day, warnings: string[]): void {
  const validDimensions = new Set<string>(SCORE_DIMENSIONS as readonly string[]);

  for (const [nodeId, node] of Object.entries(day.nodes)) {
    // Check text fields
    if (node.type === 'dialogue') {
      if (!node.text.uz || node.text.uz.trim() === '') {
        warnings.push(`Node "${nodeId}" in day "${day.id}" has empty text.uz`);
      }
      if (!node.text.ru || node.text.ru.trim() === '') {
        warnings.push(`Node "${nodeId}" in day "${day.id}" has empty text.ru`);
      }
    }

    if (node.type === 'choice') {
      if (!node.prompt.uz || node.prompt.uz.trim() === '') {
        warnings.push(`Node "${nodeId}" in day "${day.id}" has empty prompt.uz`);
      }
      if (!node.prompt.ru || node.prompt.ru.trim() === '') {
        warnings.push(`Node "${nodeId}" in day "${day.id}" has empty prompt.ru`);
      }
      for (const choice of node.choices) {
        if (!choice.text.uz || choice.text.uz.trim() === '') {
          warnings.push(
            `Choice "${choice.id}" in node "${nodeId}" day "${day.id}" has empty text.uz`,
          );
        }
        if (!choice.text.ru || choice.text.ru.trim() === '') {
          warnings.push(
            `Choice "${choice.id}" in node "${nodeId}" day "${day.id}" has empty text.ru`,
          );
        }
      }
    }

    if (node.type === 'day_intro') {
      if (!node.title.uz || node.title.uz.trim() === '') {
        warnings.push(`Node "${nodeId}" in day "${day.id}" has empty title.uz`);
      }
      if (!node.title.ru || node.title.ru.trim() === '') {
        warnings.push(`Node "${nodeId}" in day "${day.id}" has empty title.ru`);
      }
    }

    // Check score dimensions in all effects
    const allEffects = collectAllEffects(node);
    for (const effect of allEffects) {
      if (effect.type === 'add_score') {
        if (!validDimensions.has(effect.dimension)) {
          warnings.push(
            `Node "${nodeId}" in day "${day.id}" has invalid dimension "${effect.dimension}" in add_score effect`,
          );
        }
      }
    }

    // Check choice count
    if (node.type === 'choice') {
      if (node.choices.length < 2) {
        warnings.push(
          `Choice node "${nodeId}" in day "${day.id}" has fewer than 2 choices (${node.choices.length})`,
        );
      }
      if (node.multiSelect && node.choices.length < node.multiSelect.count + 1) {
        warnings.push(
          `multiSelect node "${nodeId}" in day "${day.id}" needs at least ${node.multiSelect.count + 1} choices but has ${node.choices.length}`,
        );
      }
    }
  }
}

/** Collect all effects from a node, including per-choice effects. */
function collectAllEffects(node: ScenarioNode): Effect[] {
  const effects: Effect[] = [];
  switch (node.type) {
    case 'dialogue':
      if (node.effects) effects.push(...node.effects);
      break;
    case 'score':
      effects.push(...node.effects);
      break;
    case 'end':
      effects.push(...node.effects);
      break;
    case 'choice':
      for (const choice of node.choices) {
        effects.push(...choice.effects);
      }
      break;
  }
  return effects;
}

// --- Public API ---

export function validateDay(day: Day): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Structural checks (errors)
  checkReferences(day, errors);
  checkPathsReachEnd(day, errors);

  // Reachability (warnings)
  checkReachability(day, warnings);

  // Type consistency (warnings)
  checkTypeConsistency(day, warnings);

  // Balance (warnings) — only if graph is structurally sound
  if (errors.length === 0) {
    checkBalance(day, warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateScenario(scenario: Scenario): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (scenario.days.length === 0) {
    errors.push(`Scenario "${scenario.id}" has no days`);
    return { valid: false, errors, warnings };
  }

  for (const day of scenario.days) {
    const dayResult = validateDay(day);
    for (const err of dayResult.errors) {
      errors.push(`[Day ${day.dayNumber} "${day.id}"] ${err}`);
    }
    for (const warn of dayResult.warnings) {
      warnings.push(`[Day ${day.dayNumber} "${day.id}"] ${warn}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
