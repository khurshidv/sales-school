import type { Day, ScenarioNode, DayOutcome, Language, LocalizedText } from '@/game/engine/types';

export type StaticNodeKind = 'intro' | 'dialogue' | 'choice' | 'condition' | 'score' | 'timer' | 'end';

export type EdgeKind = 'linear' | 'choice' | 'condition' | 'fallback' | 'timeout';

export interface StaticNode {
  id: string;
  kind: StaticNodeKind;
  /** Primary text (prompt for choice, text for dialogue, title for day_intro, narrator for score/end). */
  preview: LocalizedText;
  /** Additional lines shown when the card is expanded (all choice options, end dialogue, etc.). */
  expanded: Array<{ label?: LocalizedText; text: LocalizedText }>;
  speaker?: string;
  outcome?: DayOutcome;
  isRoot?: boolean;
}

export interface StaticEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  /** Optional short label (e.g. choice text for choice edges). */
  label?: LocalizedText;
  /** For choice edges: which option index (0-based). */
  choiceIndex?: number;
}

export interface StaticGraph {
  nodes: StaticNode[];
  edges: StaticEdge[];
  rootId: string;
}

function blankText(uz: string, ru: string): LocalizedText {
  return { uz, ru };
}

export function extractScenarioGraph(day: Day): StaticGraph {
  const nodes: StaticNode[] = [];
  const edges: StaticEdge[] = [];

  for (const raw of Object.values(day.nodes) as ScenarioNode[]) {
    const n = raw as ScenarioNode;
    const isRoot = n.id === day.rootNodeId;

    switch (n.type) {
      case 'dialogue': {
        nodes.push({
          id: n.id,
          kind: 'dialogue',
          preview: n.text,
          expanded: [],
          speaker: n.speaker,
          isRoot,
        });
        if (n.nextNodeId) edges.push({ from: n.id, to: n.nextNodeId, kind: 'linear' });
        break;
      }
      case 'day_intro': {
        nodes.push({
          id: n.id,
          kind: 'intro',
          preview: n.subtitle ?? n.title,
          expanded: [{ label: blankText('Sarlavha', 'Заголовок'), text: n.title }],
          isRoot,
        });
        if (n.nextNodeId) edges.push({ from: n.id, to: n.nextNodeId, kind: 'linear' });
        break;
      }
      case 'choice': {
        const expanded = n.choices.map((c, i) => ({
          label: blankText(`${i + 1}-variant`, `Вариант ${i + 1}`),
          text: c.text,
        }));
        nodes.push({ id: n.id, kind: 'choice', preview: n.prompt, expanded, isRoot });
        n.choices.forEach((c, i) => {
          edges.push({
            from: n.id,
            to: c.nextNodeId,
            kind: 'choice',
            label: c.text,
            choiceIndex: i,
          });
        });
        if (n.expireNodeId) edges.push({ from: n.id, to: n.expireNodeId, kind: 'timeout' });
        break;
      }
      case 'condition_branch': {
        const expanded = n.branches.map((b, i) => ({
          label: blankText(`Shart ${i + 1}`, `Условие ${i + 1}`),
          text: blankText(`-> ${b.nextNodeId}`, `→ ${b.nextNodeId}`),
        }));
        expanded.push({
          label: blankText('Asosiy yo‘l', 'Fallback'),
          text: blankText(`-> ${n.fallbackNodeId}`, `→ ${n.fallbackNodeId}`),
        });
        nodes.push({
          id: n.id,
          kind: 'condition',
          preview: blankText('Shartli tarmoqlanish', 'Условное ветвление'),
          expanded,
          isRoot,
        });
        n.branches.forEach((b) => edges.push({ from: n.id, to: b.nextNodeId, kind: 'condition' }));
        edges.push({ from: n.id, to: n.fallbackNodeId, kind: 'fallback' });
        break;
      }
      case 'score': {
        nodes.push({
          id: n.id,
          kind: 'score',
          preview: n.narrator ?? blankText('Ball hisoblanadi', 'Начисление очков'),
          expanded: [],
          isRoot,
        });
        if (n.nextNodeId) edges.push({ from: n.id, to: n.nextNodeId, kind: 'linear' });
        break;
      }
      case 'timer_start': {
        nodes.push({
          id: n.id,
          kind: 'timer',
          preview: blankText(`Taymer: ${n.duration}s`, `Таймер: ${n.duration}с`),
          expanded: [],
          isRoot,
        });
        edges.push({ from: n.id, to: n.nextNodeId, kind: 'linear' });
        edges.push({ from: n.id, to: n.expireNodeId, kind: 'timeout' });
        break;
      }
      case 'end': {
        const preview = n.dialogue?.text ?? blankText('Kun yakuni', 'Конец дня');
        nodes.push({
          id: n.id,
          kind: 'end',
          preview,
          expanded: [],
          speaker: n.dialogue?.speaker,
          outcome: n.outcome,
          isRoot,
        });
        break;
      }
    }
  }

  return { nodes, edges, rootId: day.rootNodeId };
}

export function localize(t: LocalizedText, lang: Language): string {
  return t[lang] ?? t.ru ?? t.uz ?? '';
}

export function truncateWords(text: string, wordCount: number): { short: string; truncated: boolean } {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return { short: text, truncated: false };
  return { short: words.slice(0, wordCount).join(' ') + '…', truncated: true };
}
