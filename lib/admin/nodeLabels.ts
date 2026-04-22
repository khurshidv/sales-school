import 'server-only';
import { SCENARIOS } from '@/game/data/scenarios';
import type { ScenarioNode, LocalizedText } from '@/game/engine/types';

export interface NodeLabel {
  title: string;
  type: ScenarioNode['type'];
  preview: string | null;
  dayId: string | null;
}

const cache = new Map<string, NodeLabel>();

export function resolveNodeLabel(scenarioId: string, nodeId: string): NodeLabel {
  const key = `${scenarioId}::${nodeId}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const scenario = SCENARIOS[scenarioId];
  const fallback: NodeLabel = { title: nodeId, type: 'dialogue', preview: null, dayId: null };
  if (!scenario) return fallback;

  for (const day of scenario.days) {
    const node = day.nodes[nodeId];
    if (!node) continue;
    const label: NodeLabel = {
      title: deriveTitle(node),
      type: node.type,
      preview: derivePreview(node),
      dayId: day.id,
    };
    cache.set(key, label);
    return label;
  }
  return fallback;
}

function deriveTitle(n: ScenarioNode): string {
  if (n.type === 'dialogue') return truncate(pickRu(n.text), 60);
  if (n.type === 'choice') return truncate(pickRu(n.prompt), 60);
  if (n.type === 'day_intro') return truncate(pickRu(n.title), 60);
  if (n.type === 'score') return n.narrator ? truncate(pickRu(n.narrator), 60) : `[${n.type}]`;
  return `[${n.type}]`;
}

function derivePreview(n: ScenarioNode): string | null {
  if (n.type === 'dialogue') return pickRu(n.text);
  if (n.type === 'choice') return pickRu(n.prompt);
  if (n.type === 'day_intro') return pickRu(n.title);
  if (n.type === 'score' && n.narrator) return pickRu(n.narrator);
  return null;
}

function pickRu(t: LocalizedText): string {
  return t.ru || t.uz || '';
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
