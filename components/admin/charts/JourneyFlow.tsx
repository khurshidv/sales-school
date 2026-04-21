'use client';

import { useMemo, useState } from 'react';
import type { BranchFlowRow, NodeStat, DropoffRow } from '@/lib/admin/types-v2';

export interface JourneyFlowProps {
  flows: BranchFlowRow[];
  stats: NodeStat[];
  dropoffs: DropoffRow[];
  height?: number;
}

const COL_WIDTH = 176;
const COL_GAP = 72;
const NODE_HEIGHT = 60;
const NODE_GAP = 10;
const PAD_X = 24;
const PAD_Y = 24;

type Group = 'start' | 'choice' | 'dialogue' | 'end' | 'dropoff';

interface LaidNode {
  id: string;
  short: string;
  col: number;
  row: number;
  x: number;
  y: number;
  entered: number;
  dropoff: number;
  group: Group;
}

interface LaidEdge {
  from: string;
  to: string;
  value: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function classify(id: string, dropoff: number): Group {
  if (dropoff > 0) return 'dropoff';
  if (id.includes('end_') || id.endsWith('_success') || id.endsWith('_fail')) return 'end';
  if (id.includes('choice') || id.includes('_ch_')) return 'choice';
  if (id.includes('intro') || id.includes('day_start')) return 'start';
  return 'dialogue';
}

function shortLabel(id: string): string {
  // strip common prefixes like "d1_", "car-day1_"
  const s = id.replace(/^(car-)?d(ay)?\d+[_-]?/i, '').replace(/_/g, ' ');
  return s.length > 22 ? s.slice(0, 21) + '…' : s;
}

function layout(flows: BranchFlowRow[], stats: NodeStat[], drops: DropoffRow[]) {
  const nodes = new Set<string>();
  const adj = new Map<string, string[]>();
  const rev = new Map<string, string[]>();
  for (const f of flows) {
    if (f.from_node === f.to_node) continue;
    nodes.add(f.from_node);
    nodes.add(f.to_node);
    (adj.get(f.from_node) ?? adj.set(f.from_node, []).get(f.from_node)!).push(f.to_node);
    (rev.get(f.to_node) ?? rev.set(f.to_node, []).get(f.to_node)!).push(f.from_node);
  }

  // roots: nodes with no incoming edge
  const roots = [...nodes].filter((n) => !rev.has(n));
  const depth = new Map<string, number>();
  const queue: Array<[string, number]> = roots.map((r) => [r, 0]);
  if (queue.length === 0 && nodes.size > 0) queue.push([[...nodes][0], 0]);

  const maxDepth = nodes.size;
  while (queue.length > 0) {
    const [cur, d] = queue.shift()!;
    if (d > maxDepth) continue;
    const prev = depth.get(cur) ?? -1;
    if (d <= prev) continue;
    depth.set(cur, d);
    for (const next of adj.get(cur) ?? []) queue.push([next, d + 1]);
  }

  // any remaining (cycle-only) nodes get depth based on neighbors
  for (const n of nodes) {
    if (!depth.has(n)) {
      const neighborDepths = (rev.get(n) ?? []).map((x) => depth.get(x) ?? 0);
      depth.set(n, neighborDepths.length ? Math.max(...neighborDepths) + 1 : 0);
    }
  }

  const statMap = new Map(stats.map((s) => [s.node_id, s]));
  const dropMap = new Map(drops.map((d) => [d.node_id, d.dropoff_count]));

  // group by column
  const byCol = new Map<number, string[]>();
  for (const n of nodes) {
    const c = depth.get(n) ?? 0;
    (byCol.get(c) ?? byCol.set(c, []).get(c)!).push(n);
  }
  // sort each column: drop-offs first, then by entry count desc
  for (const arr of byCol.values()) {
    arr.sort((a, b) => {
      const da = dropMap.get(a) ?? 0;
      const db = dropMap.get(b) ?? 0;
      if ((db > 0 ? 1 : 0) !== (da > 0 ? 1 : 0)) return (db > 0 ? 1 : 0) - (da > 0 ? 1 : 0);
      return (statMap.get(b)?.entered_count ?? 0) - (statMap.get(a)?.entered_count ?? 0);
    });
  }

  const maxCol = Math.max(...byCol.keys(), 0);
  const maxRows = Math.max(...[...byCol.values()].map((v) => v.length), 1);

  const laidNodes: LaidNode[] = [];
  const nodePos = new Map<string, { x: number; y: number }>();
  for (let c = 0; c <= maxCol; c++) {
    const col = byCol.get(c) ?? [];
    const colHeight = col.length * (NODE_HEIGHT + NODE_GAP) - NODE_GAP;
    const totalHeight = maxRows * (NODE_HEIGHT + NODE_GAP) - NODE_GAP;
    const offsetY = (totalHeight - colHeight) / 2;
    col.forEach((id, r) => {
      const x = PAD_X + c * (COL_WIDTH + COL_GAP);
      const y = PAD_Y + offsetY + r * (NODE_HEIGHT + NODE_GAP);
      const dropoff = dropMap.get(id) ?? 0;
      const entered = statMap.get(id)?.entered_count ?? 0;
      laidNodes.push({
        id,
        short: shortLabel(id),
        col: c,
        row: r,
        x,
        y,
        entered,
        dropoff,
        group: classify(id, dropoff),
      });
      nodePos.set(id, { x, y });
    });
  }

  const laidEdges: LaidEdge[] = [];
  for (const f of flows) {
    if (f.from_node === f.to_node) continue;
    const a = nodePos.get(f.from_node);
    const b = nodePos.get(f.to_node);
    if (!a || !b) continue;
    laidEdges.push({
      from: f.from_node,
      to: f.to_node,
      value: f.flow_count,
      x1: a.x + COL_WIDTH,
      y1: a.y + NODE_HEIGHT / 2,
      x2: b.x,
      y2: b.y + NODE_HEIGHT / 2,
    });
  }

  const totalWidth = PAD_X * 2 + (maxCol + 1) * COL_WIDTH + maxCol * COL_GAP;
  const totalHeight = PAD_Y * 2 + maxRows * (NODE_HEIGHT + NODE_GAP) - NODE_GAP;

  return { nodes: laidNodes, edges: laidEdges, width: totalWidth, height: totalHeight };
}

const GROUP_STYLE: Record<Group, { bg: string; border: string; text: string; dot: string; label: string }> = {
  start:    { bg: '#eef2ff', border: '#c7d2fe', text: '#3730a3', dot: '#6366f1', label: 'Старт' },
  dialogue: { bg: '#faf5ff', border: '#e9d5ff', text: '#6b21a8', dot: '#a855f7', label: 'Диалог' },
  choice:   { bg: '#fdf2f8', border: '#fbcfe8', text: '#9d174d', dot: '#ec4899', label: 'Выбор' },
  end:      { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', dot: '#10b981', label: 'Финал' },
  dropoff:  { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', dot: '#f97316', label: 'Drop-off' },
};

export default function JourneyFlow({ flows, stats, dropoffs, height = 560 }: JourneyFlowProps) {
  const { nodes, edges, width, height: contentHeight } = useMemo(
    () => layout(flows, stats, dropoffs),
    [flows, stats, dropoffs],
  );

  const [hover, setHover] = useState<string | null>(null);

  const maxValue = useMemo(() => Math.max(1, ...edges.map((e) => e.value)), [edges]);
  const maxEntered = useMemo(() => Math.max(1, ...nodes.map((n) => n.entered)), [nodes]);

  const { activeEdges, activeNodes } = useMemo(() => {
    if (!hover) return { activeEdges: new Set<string>(), activeNodes: new Set<string>() };
    const e = new Set<string>();
    const n = new Set<string>([hover]);
    for (const edge of edges) {
      if (edge.from === hover) { e.add(`${edge.from}→${edge.to}`); n.add(edge.to); }
      if (edge.to === hover)   { e.add(`${edge.from}→${edge.to}`); n.add(edge.from); }
    }
    return { activeEdges: e, activeNodes: n };
  }, [hover, edges]);

  if (nodes.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)', fontSize: 13 }}>
        Нет данных за выбранный период
      </div>
    );
  }

  const groups: Group[] = ['start', 'dialogue', 'choice', 'end', 'dropoff'];

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12, fontSize: 11, color: 'var(--admin-text-dim)' }}>
        {groups.map((g) => (
          <span key={g} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: GROUP_STYLE[g].dot }} />
            {GROUP_STYLE[g].label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto' }}>Наведите на узел — подсветятся связи</span>
      </div>

      <div style={{ overflow: 'auto', maxHeight: height, border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-md)', background: 'linear-gradient(180deg, rgba(139,92,246,0.02), rgba(236,72,153,0.02))' }}>
        <div style={{ position: 'relative', width, height: contentHeight }}>
          <svg
            width={width}
            height={contentHeight}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            <defs>
              <marker id="jf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
              </marker>
              <marker id="jf-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
              </marker>
            </defs>
            {edges.map((e) => {
              const key = `${e.from}→${e.to}`;
              const isActive = activeEdges.has(key);
              const dimmed = hover && !isActive;
              const stroke = isActive ? '#8b5cf6' : '#cbd5e1';
              const midX = (e.x1 + e.x2) / 2;
              const d = `M ${e.x1} ${e.y1} C ${midX} ${e.y1}, ${midX} ${e.y2}, ${e.x2} ${e.y2}`;
              const thickness = 1 + (e.value / maxValue) * 3;
              return (
                <path
                  key={key}
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={isActive ? thickness + 1 : thickness}
                  opacity={dimmed ? 0.12 : isActive ? 0.95 : 0.55}
                  markerEnd={isActive ? 'url(#jf-arrow-active)' : 'url(#jf-arrow)'}
                  style={{ transition: 'stroke 120ms, opacity 120ms, stroke-width 120ms' }}
                />
              );
            })}
          </svg>

          {nodes.map((n) => {
            const style = GROUP_STYLE[n.group];
            const isHover = hover === n.id;
            const isActive = activeNodes.has(n.id);
            const dimmed = hover && !isActive;
            const barPct = Math.min(100, (n.entered / maxEntered) * 100);
            return (
              <div
                key={n.id}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover((h) => (h === n.id ? null : h))}
                title={n.id}
                style={{
                  position: 'absolute',
                  left: n.x,
                  top: n.y,
                  width: COL_WIDTH,
                  height: NODE_HEIGHT,
                  background: style.bg,
                  border: `1px solid ${isHover || isActive ? style.dot : style.border}`,
                  borderRadius: 10,
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isHover ? '0 6px 20px rgba(0,0,0,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
                  opacity: dimmed ? 0.35 : 1,
                  cursor: 'default',
                  transition: 'opacity 120ms, box-shadow 120ms, border-color 120ms',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: style.dot, flexShrink: 0 }} />
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: style.text,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {n.short}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ flex: 1, height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${barPct}%`, height: '100%', background: style.dot, opacity: 0.8 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: style.text, fontVariantNumeric: 'tabular-nums' }}>
                    {n.entered}
                  </span>
                  {n.dropoff > 0 && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: 4,
                      background: '#f97316',
                      color: 'white',
                    }}>
                      −{n.dropoff}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
