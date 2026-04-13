// ============================================================
// Asset Graph — BFS traversal of scenario DAG for predictive
// asset preloading with probability-weighted priorities.
// Pure TS, no React.
// ============================================================

import type {
  Day,
  ScenarioNode,
  DialogueNode,
  ChoiceNode,
  DayIntroNode,
  EndNode,
  CharacterOnScreen,
} from '@/game/engine/types';
import { CHARACTERS } from '@/game/data/characters/index';

// --- Types ---

export interface AssetEntry {
  url: string;
  priority: number; // 0–1, higher = more urgent
}

// --- Helpers ---

function characterUrl(charId: string, emotion: string): string | null {
  const char = CHARACTERS[charId];
  return char ? char.assetPath(emotion) : null;
}

function backgroundUrl(scenarioId: string, bgId: string): string {
  return `/assets/scenarios/${scenarioId}/backgrounds/${bgId}.jpg`;
}

/** Extract every asset URL a single node may reference. */
export function collectNodeAssets(
  node: ScenarioNode,
  scenarioId: string,
): string[] {
  const urls: string[] = [];

  switch (node.type) {
    case 'dialogue': {
      const d = node as DialogueNode;
      if (d.background) urls.push(backgroundUrl(scenarioId, d.background));
      // Speaker sprite
      if (d.speaker && d.speaker !== 'narrator' && d.emotion) {
        const u = characterUrl(d.speaker, d.emotion);
        if (u) urls.push(u);
      }
      // Multi-character sprites
      if (d.characters) {
        for (const c of d.characters) {
          const u = characterUrl(c.id, c.emotion);
          if (u) urls.push(u);
        }
      }
      break;
    }
    case 'day_intro': {
      const di = node as DayIntroNode;
      urls.push(backgroundUrl(scenarioId, di.background));
      break;
    }
    case 'end': {
      const e = node as EndNode;
      if (e.dialogue) {
        if (e.dialogue.background) {
          urls.push(backgroundUrl(scenarioId, e.dialogue.background));
        }
        if (e.dialogue.speaker && e.dialogue.speaker !== 'narrator' && e.dialogue.emotion) {
          const u = characterUrl(e.dialogue.speaker, e.dialogue.emotion);
          if (u) urls.push(u);
        }
        if (e.dialogue.characters) {
          for (const c of e.dialogue.characters) {
            const u = characterUrl(c.id, c.emotion);
            if (u) urls.push(u);
          }
        }
      }
      break;
    }
    // choice, condition_branch, score, timer_start — no direct assets
  }

  return urls;
}

/**
 * Get all successor node IDs for a given node.
 * For choice nodes, returns all branch targets (each weighted by 1/numChoices).
 */
function getSuccessors(
  node: ScenarioNode,
): Array<{ nodeId: string; branchFactor: number }> {
  switch (node.type) {
    case 'dialogue':
      return [{ nodeId: (node as DialogueNode).nextNodeId, branchFactor: 1 }];
    case 'day_intro':
      return [{ nodeId: (node as DayIntroNode).nextNodeId, branchFactor: 1 }];
    case 'choice': {
      const c = node as ChoiceNode;
      const factor = c.choices.length;
      const successors = c.choices.map((ch) => ({
        nodeId: ch.nextNodeId,
        branchFactor: factor,
      }));
      if (c.expireNodeId) {
        successors.push({ nodeId: c.expireNodeId, branchFactor: factor });
      }
      return successors;
    }
    case 'condition_branch': {
      const branches = node.branches.map((b) => ({
        nodeId: b.nextNodeId,
        branchFactor: node.branches.length + 1, // +1 for fallback
      }));
      branches.push({
        nodeId: node.fallbackNodeId,
        branchFactor: node.branches.length + 1,
      });
      return branches;
    }
    case 'score':
      return [{ nodeId: node.nextNodeId, branchFactor: 1 }];
    case 'timer_start': {
      const successors = [{ nodeId: node.nextNodeId, branchFactor: 1 }];
      if (node.expireNodeId) {
        successors.push({ nodeId: node.expireNodeId, branchFactor: 2 });
      }
      return successors;
    }
    case 'end':
      return [];
  }
}

/**
 * BFS from `startNodeId` up to `depth` transitions.
 * Returns a prioritized list of asset URLs sorted by descending priority.
 * Assets for the immediate next node get priority ~1.0; deeper/branched
 * nodes get lower priority proportional to 1/(depth * branchFactor).
 *
 * Already-loaded URLs (from `loadedSet`) are excluded from the result.
 */
export function buildPreloadQueue(
  day: Day,
  startNodeId: string,
  scenarioId: string,
  depth: number,
  loadedSet: ReadonlySet<string>,
): AssetEntry[] {
  const assetMap = new Map<string, number>(); // url → best priority
  const visited = new Set<string>();

  // BFS queue: [nodeId, currentDepth, cumulativeBranchFactor]
  const queue: Array<[string, number, number]> = [[startNodeId, 0, 1]];

  while (queue.length > 0) {
    const [nodeId, d, cumBranch] = queue.shift()!;

    if (d > depth || visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = day.nodes[nodeId];
    if (!node) continue;

    // Priority: closer & less branched = higher priority
    // depth 0 → priority 1.0, depth 1 with 1 branch → 0.5, etc.
    const priority = 1 / (1 + d * cumBranch);

    const urls = collectNodeAssets(node, scenarioId);
    for (const url of urls) {
      if (loadedSet.has(url)) continue;
      const existing = assetMap.get(url);
      if (existing === undefined || priority > existing) {
        assetMap.set(url, priority);
      }
    }

    // Enqueue successors
    for (const { nodeId: nextId, branchFactor } of getSuccessors(node)) {
      if (!visited.has(nextId)) {
        queue.push([nextId, d + 1, cumBranch * branchFactor]);
      }
    }
  }

  // Sort descending by priority
  const entries: AssetEntry[] = [];
  for (const [url, priority] of assetMap) {
    entries.push({ url, priority });
  }
  entries.sort((a, b) => b.priority - a.priority);

  return entries;
}

/**
 * Collect the minimal set of assets needed to render the very first
 * visible node (day_intro or first dialogue). Used for critical-path
 * preloading — only these block the game start.
 */
export function getCriticalAssets(
  day: Day,
  scenarioId: string,
): string[] {
  const rootNode = day.nodes[day.rootNodeId];
  if (!rootNode) return [];

  const urls = collectNodeAssets(rootNode, scenarioId);

  // If root is day_intro, also collect the first dialogue node's assets
  if (rootNode.type === 'day_intro') {
    const nextNode = day.nodes[(rootNode as DayIntroNode).nextNodeId];
    if (nextNode) {
      urls.push(...collectNodeAssets(nextNode, scenarioId));
    }
  }

  return [...new Set(urls)];
}
