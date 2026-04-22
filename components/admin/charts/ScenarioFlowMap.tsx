'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { BranchFlowRow, NodeStat, DropoffRow } from '@/lib/admin/types-v2';
import type { Day, Language } from '@/game/engine/types';
import {
  extractScenarioGraph,
  localize,
  type StaticNode,
  type StaticEdge,
  type StaticNodeKind,
  type EdgeKind,
} from '@/lib/admin/branch/extractScenarioGraph';

export interface ScenarioFlowMapProps {
  day: Day;
  flows: BranchFlowRow[];
  stats: NodeStat[];
  dropoffs: DropoffRow[];
  language?: Language;
  height?: number;
  heatmapMode?: 'none' | 'traffic' | 'dropoff';
  onNodeClick?: (nodeId: string) => void;
}

// ---- Layout constants ----
const CARD_WIDTH = 280;
// Height of a collapsed card. Sized to fit: header (22) + id (16) +
// 3 lines of preview text (≈60) + footer (22) + padding (20) + gaps ≈ 160.
// Preview is line-clamped to 3 lines so cards can't exceed this height
// when collapsed.
const CARD_HEIGHT = 170;
const COL_GAP = 110;
const ROW_GAP = 32;
const PAD_X = 32;
const PAD_Y = 32;
const PREVIEW_LINES = 3;

// ---- Visual tokens per node kind ----
const KIND_STYLE: Record<StaticNodeKind, {
  label: string;
  accent: string;       // active dot color
  accentDim: string;    // unvisited dot color
  bg: string;           // active card bg
  border: string;       // active border
  text: string;         // active heading text
}> = {
  intro:     { label: 'Интро',     accent: '#6366f1', accentDim: '#c7d2fe', bg: '#eef2ff', border: '#c7d2fe', text: '#3730a3' },
  dialogue:  { label: 'Диалог',    accent: '#a855f7', accentDim: '#e9d5ff', bg: '#faf5ff', border: '#e9d5ff', text: '#6b21a8' },
  choice:    { label: 'Выбор',     accent: '#ec4899', accentDim: '#fbcfe8', bg: '#fdf2f8', border: '#fbcfe8', text: '#9d174d' },
  condition: { label: 'Условие',   accent: '#0ea5e9', accentDim: '#bae6fd', bg: '#f0f9ff', border: '#bae6fd', text: '#075985' },
  score:     { label: 'Очки',      accent: '#f59e0b', accentDim: '#fde68a', bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  timer:     { label: 'Таймер',    accent: '#ef4444', accentDim: '#fecaca', bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
  end:       { label: 'Финал',     accent: '#10b981', accentDim: '#a7f3d0', bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46' },
};

const OUTCOME_STYLE: Record<string, { bg: string; border: string; text: string; label: string }> = {
  success:       { bg: '#d1fae5', border: '#10b981', text: '#065f46', label: 'Успех' },
  partial:       { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', label: 'Частично' },
  failure:       { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', label: 'Провал' },
  hidden_ending: { bg: '#ede9fe', border: '#7c3aed', text: '#5b21b6', label: 'Скрытая' },
};

const EDGE_STYLE: Record<EdgeKind, { stroke: string; dash?: string }> = {
  linear:    { stroke: '#94a3b8' },
  choice:    { stroke: '#ec4899' },
  condition: { stroke: '#0ea5e9', dash: '6 4' },
  fallback:  { stroke: '#64748b', dash: '2 4' },
  timeout:   { stroke: '#ef4444', dash: '4 3' },
};

// ---- Layout algorithm: BFS depth from root ----

interface LaidCard extends StaticNode {
  col: number;
  row: number;
  x: number;
  y: number;
}

interface LaidConnection extends StaticEdge {
  x1: number; y1: number; x2: number; y2: number;
}

function computeLayout(nodes: StaticNode[], edges: StaticEdge[], rootId: string) {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }

  const depth = new Map<string, number>();
  const queue: Array<[string, number]> = [[rootId, 0]];
  const maxDepth = nodes.length;

  while (queue.length > 0) {
    const [cur, d] = queue.shift()!;
    if (d > maxDepth) continue;
    const prev = depth.get(cur) ?? -1;
    if (d <= prev) continue;
    depth.set(cur, d);
    for (const next of adj.get(cur) ?? []) queue.push([next, d + 1]);
  }

  // any orphan nodes (unreachable from root) -> assign them to depth 0 in an "orphan" lane
  for (const n of nodes) if (!depth.has(n.id)) depth.set(n.id, 0);

  // group by column
  const byCol = new Map<number, StaticNode[]>();
  for (const n of nodes) {
    const c = depth.get(n.id)!;
    if (!byCol.has(c)) byCol.set(c, []);
    byCol.get(c)!.push(n);
  }

  // sort within column: end nodes last; choice nodes in the middle; otherwise by id
  for (const arr of byCol.values()) {
    arr.sort((a, b) => {
      const rank: Record<StaticNodeKind, number> = {
        intro: 0, dialogue: 1, score: 2, timer: 3, condition: 4, choice: 5, end: 6,
      };
      return rank[a.kind] - rank[b.kind] || a.id.localeCompare(b.id);
    });
  }

  const maxCol = Math.max(...byCol.keys(), 0);
  const maxRows = Math.max(...[...byCol.values()].map((v) => v.length), 1);

  const positions = new Map<string, { x: number; y: number }>();
  const laid: LaidCard[] = [];
  for (let c = 0; c <= maxCol; c++) {
    const col = byCol.get(c) ?? [];
    const totalH = maxRows * (CARD_HEIGHT + ROW_GAP) - ROW_GAP;
    const colH = col.length * (CARD_HEIGHT + ROW_GAP) - ROW_GAP;
    const offsetY = (totalH - colH) / 2;
    col.forEach((node, r) => {
      const x = PAD_X + c * (CARD_WIDTH + COL_GAP);
      const y = PAD_Y + offsetY + r * (CARD_HEIGHT + ROW_GAP);
      laid.push({ ...node, col: c, row: r, x, y });
      positions.set(node.id, { x, y });
    });
  }

  const connections: LaidConnection[] = [];
  for (const e of edges) {
    const a = positions.get(e.from);
    const b = positions.get(e.to);
    if (!a || !b) continue;
    connections.push({
      ...e,
      x1: a.x + CARD_WIDTH,
      y1: a.y + CARD_HEIGHT / 2,
      x2: b.x,
      y2: b.y + CARD_HEIGHT / 2,
    });
  }

  const width = PAD_X * 2 + (maxCol + 1) * CARD_WIDTH + maxCol * COL_GAP;
  const height = PAD_Y * 2 + maxRows * (CARD_HEIGHT + ROW_GAP) - ROW_GAP;

  return { cards: laid, connections, width, height };
}

// ---- Main component ----

export default function ScenarioFlowMap({
  day,
  flows,
  stats,
  dropoffs,
  language = 'ru',
  height = 640,
  heatmapMode = 'none',
  onNodeClick,
}: ScenarioFlowMapProps) {
  const { nodes, edges, rootId } = useMemo(() => extractScenarioGraph(day), [day]);
  const { cards, connections, width, height: contentH } = useMemo(
    () => computeLayout(nodes, edges, rootId),
    [nodes, edges, rootId],
  );

  const statsMap = useMemo(() => new Map(stats.map((s) => [s.node_id, s])), [stats]);
  const dropMap = useMemo(() => new Map(dropoffs.map((d) => [d.node_id, d.dropoff_count])), [dropoffs]);
  const edgeMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of flows) m.set(`${f.from_node}→${f.to_node}`, (m.get(`${f.from_node}→${f.to_node}`) ?? 0) + f.flow_count);
    return m;
  }, [flows]);
  const outflowByNode = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of flows) m.set(f.from_node, (m.get(f.from_node) ?? 0) + f.flow_count);
    return m;
  }, [flows]);

  // Denominator for node visit %: the largest "funnel top" we can observe.
  // Usually the root node, but if any upstream node was logged more than the
  // root (can happen when the root node was added after analytics shipped),
  // fall back to the max so percentages stay sane (0..100).
  const maxVisits = Math.max(
    statsMap.get(rootId)?.entered_count ?? 0,
    ...stats.map((s) => s.entered_count),
  );

  const maxEntered = useMemo(() => Math.max(1, ...stats.map(s => s.entered_count)), [stats]);

  function nodeBg(nodeId: string): string | undefined {
    if (!heatmapMode || heatmapMode === 'none') return undefined;
    const stat = statsMap.get(nodeId);
    const entered = stat?.entered_count ?? 0;
    if (heatmapMode === 'traffic') {
      const intensity = entered / maxEntered;
      const alpha = Math.round(intensity * 200).toString(16).padStart(2, '0');
      return `#6366f1${alpha}`;
    }
    // dropoff
    const drop = dropMap.get(nodeId) ?? 0;
    const rate = entered > 0 ? drop / entered : 0;
    if (rate >= 0.30) return 'rgba(239, 68, 68, 0.6)';
    if (rate >= 0.10) return 'rgba(245, 158, 11, 0.5)';
    return 'rgba(16, 185, 129, 0.3)';
  }

  const [expanded, setExpanded] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  // Which edges to highlight on hover
  const { activeEdges, activeNodes } = useMemo(() => {
    if (!hover) return { activeEdges: new Set<string>(), activeNodes: new Set<string>() };
    const e = new Set<string>();
    const n = new Set<string>([hover]);
    for (const c of connections) {
      if (c.from === hover) { e.add(`${c.from}→${c.to}`); n.add(c.to); }
      if (c.to === hover)   { e.add(`${c.from}→${c.to}`); n.add(c.from); }
    }
    return { activeEdges: e, activeNodes: n };
  }, [hover, connections]);

  return (
    <div>
      <Legend />

      <div
        style={{
          overflow: 'auto',
          maxHeight: height,
          border: '1px solid var(--admin-border)',
          borderRadius: 'var(--admin-radius-md)',
          background:
            'radial-gradient(circle at 0% 0%, rgba(139,92,246,0.04), transparent 40%), radial-gradient(circle at 100% 100%, rgba(236,72,153,0.04), transparent 40%), #fcfcfd',
        }}
      >
        <div style={{ position: 'relative', width, height: contentH }}>
          <svg
            width={width}
            height={contentH}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            <defs>
              {(Object.keys(EDGE_STYLE) as EdgeKind[]).map((k) => (
                <marker
                  key={k}
                  id={`sfm-arrow-${k}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_STYLE[k].stroke} />
                </marker>
              ))}
            </defs>
            {connections.map((c) => {
              const key = `${c.from}→${c.to}`;
              const flow = edgeMap.get(key) ?? 0;
              const visited = flow > 0;
              const isActive = activeEdges.has(key);
              const dimmed = hover && !isActive;
              const style = EDGE_STYLE[c.kind];
              const midX = (c.x1 + c.x2) / 2;
              const d = `M ${c.x1} ${c.y1} C ${midX} ${c.y1}, ${midX} ${c.y2}, ${c.x2} ${c.y2}`;
              const outSum = outflowByNode.get(c.from) ?? 0;
              const pct = outSum > 0 ? Math.round((flow / outSum) * 100) : 0;
              const thickness = visited ? 1.5 + Math.min(3, flow / 3) : 1;
              return (
                <g key={key} style={{ transition: 'opacity 120ms' }}>
                  <path
                    d={d}
                    fill="none"
                    stroke={style.stroke}
                    strokeWidth={isActive ? thickness + 1 : thickness}
                    strokeDasharray={style.dash}
                    opacity={dimmed ? 0.08 : visited ? (isActive ? 1 : 0.75) : 0.25}
                    markerEnd={`url(#sfm-arrow-${c.kind})`}
                  />
                  {visited && (
                    <g transform={`translate(${midX} ${(c.y1 + c.y2) / 2})`}>
                      <rect x={-26} y={-9} width={52} height={18} rx={9}
                            fill="white" stroke={style.stroke} strokeWidth={0.75}
                            opacity={dimmed ? 0.15 : 0.95} />
                      <text
                        textAnchor="middle"
                        y={4}
                        fontSize={10}
                        fontWeight={600}
                        fill={style.stroke}
                        opacity={dimmed ? 0.3 : 1}
                      >
                        {flow} · {pct}%
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {cards.map((card) => (
            <NodeCard
              key={card.id}
              card={card}
              stat={statsMap.get(card.id)}
              dropoff={dropMap.get(card.id) ?? 0}
              rootVisits={maxVisits}
              isExpanded={expanded === card.id}
              isHover={hover === card.id}
              isDimmed={!!hover && !activeNodes.has(card.id)}
              onToggle={() => setExpanded((e) => (e === card.id ? null : card.id))}
              onHoverIn={() => setHover(card.id)}
              onHoverOut={() => setHover((h) => (h === card.id ? null : h))}
              language={language}
              heatmapBg={nodeBg(card.id)}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Legend ----

function Legend() {
  const kinds: StaticNodeKind[] = ['intro', 'dialogue', 'choice', 'condition', 'score', 'timer', 'end'];
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12, fontSize: 11, color: 'var(--admin-text-dim)' }}>
      {kinds.map((k) => (
        <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: KIND_STYLE[k].accent }} />
          {KIND_STYLE[k].label}
        </span>
      ))}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 18, height: 2, background: '#94a3b8' }} />
        линейный
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 18, height: 2, background: '#ec4899' }} />
        выбор
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 18, height: 2,
          backgroundImage: 'linear-gradient(to right, #0ea5e9 50%, transparent 50%)',
          backgroundSize: '6px 2px',
        }} />
        условие
      </span>
      <span style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
        Непосещённые узлы приглушены · цифры на рёбрах = игроков · %
      </span>
    </div>
  );
}

// ---- Card ----

interface NodeCardProps {
  card: LaidCard;
  stat: NodeStat | undefined;
  dropoff: number;
  rootVisits: number;
  isExpanded: boolean;
  isHover: boolean;
  isDimmed: boolean;
  onToggle: () => void;
  onHoverIn: () => void;
  onHoverOut: () => void;
  language: Language;
  heatmapBg?: string;
  onNodeClick?: (nodeId: string) => void;
}

function NodeCard({
  card, stat, dropoff, rootVisits, isExpanded, isHover, isDimmed, onToggle, onHoverIn, onHoverOut, language, heatmapBg, onNodeClick,
}: NodeCardProps) {
  const entered = stat?.entered_count ?? 0;
  const visited = entered > 0;
  const style = KIND_STYLE[card.kind];
  const outcomeStyle = card.outcome ? OUTCOME_STYLE[card.outcome] : undefined;
  const pct = rootVisits > 0 ? Math.min(100, Math.round((entered / rootVisits) * 100)) : 0;

  const previewText = localize(card.preview, language);

  const dotBg = visited ? style.accent : style.accentDim;
  const cardBg = visited ? style.bg : '#f8fafc';
  const cardBorder = isHover ? style.accent : visited ? style.border : '#e2e8f0';
  const headingColor = visited ? style.text : '#64748b';

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onToggle(); onNodeClick?.(card.id); }}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      style={{
        position: 'absolute',
        left: card.x,
        top: card.y,
        width: CARD_WIDTH,
        height: isExpanded ? 'auto' : CARD_HEIGHT,
        background: heatmapBg ?? cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 10,
        padding: 10,
        opacity: isDimmed ? 0.3 : visited ? 1 : 0.6,
        boxShadow: isHover || isExpanded ? '0 10px 24px rgba(15, 23, 42, 0.12)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
        zIndex: isExpanded ? 20 : isHover ? 10 : 1,
        cursor: 'pointer',
        transition: 'opacity 120ms, box-shadow 120ms, border-color 120ms',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontFamily: 'inherit',
      }}
    >
      {/* Header: dot · type · speaker/root/outcome badges · expand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: dotBg, flexShrink: 0 }} />
        <span style={{ color: headingColor }}>{style.label}</span>
        {card.speaker && <span style={{ color: 'var(--admin-text-muted)', textTransform: 'none', fontWeight: 500 }}>· {card.speaker}</span>}
        {card.isRoot && (
          <span style={{ padding: '1px 6px', fontSize: 9, background: '#6366f1', color: 'white', borderRadius: 999, marginLeft: 4 }}>
            start
          </span>
        )}
        {outcomeStyle && (
          <span style={{
            padding: '1px 6px', fontSize: 9, fontWeight: 700, background: outcomeStyle.bg, color: outcomeStyle.text,
            border: `1px solid ${outcomeStyle.border}`, borderRadius: 999, marginLeft: 4,
          }}>
            {outcomeStyle.label}
          </span>
        )}
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', color: 'var(--admin-text-dim)' }}>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>

      {/* Node id (short, monospaced) */}
      <div style={{ fontSize: 9, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {card.id}
      </div>

      {/* Preview or full text */}
      <div
        style={{
          fontSize: 12,
          lineHeight: 1.45,
          color: headingColor,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: isExpanded ? 'unset' : PREVIEW_LINES,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {previewText}
      </div>

      {/* Expanded extras: choice options / branches */}
      {isExpanded && card.expanded.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 6, borderTop: `1px dashed ${style.border}` }}>
          {card.expanded.map((ex, i) => (
            <div key={i} style={{ fontSize: 11, lineHeight: 1.4 }}>
              {ex.label && (
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: style.accent, letterSpacing: 0.4 }}>
                  {localize(ex.label, language)}
                </div>
              )}
              <div style={{ color: '#475569' }}>{localize(ex.text, language)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Footer: traffic bar + counters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(15,23,42,0.06)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: dotBg, opacity: 0.85 }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: headingColor, fontVariantNumeric: 'tabular-nums' }}>
          {visited ? `${entered}` : '—'}
        </span>
        <span style={{ fontSize: 10, color: 'var(--admin-text-dim)', fontVariantNumeric: 'tabular-nums', minWidth: 28, textAlign: 'right' }}>
          {visited ? `${pct}%` : ''}
        </span>
        {dropoff > 0 && (
          <span style={{
            padding: '1px 5px', fontSize: 9, fontWeight: 700,
            background: '#f97316', color: 'white', borderRadius: 4,
          }}>
            −{dropoff}
          </span>
        )}
        {!visited && <span style={{ fontSize: 9, color: '#94a3b8', fontStyle: 'italic' }}>не посещён</span>}
      </div>
    </div>
  );
}
