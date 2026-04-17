'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { GraphData } from '@/lib/admin/types-v2';

// react-force-graph-2d uses HTML5 Canvas + window measurements. Import dynamically
// to skip SSR — Next 16's server pass would otherwise crash on `window`.
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

const GROUP_COLOR: Record<GraphData['nodes'][number]['group'], string> = {
  success: '#10b981',
  warn:    '#f59e0b',
  fail:    '#ef4444',
  neutral: '#94a3b8',
};

export interface ScenarioMapProps {
  data: GraphData;
  height?: number;
}

export default function ScenarioMap({ data, height = 520 }: ScenarioMapProps) {
  const maxSize = useMemo(
    () => Math.max(1, ...data.nodes.map((n) => n.size)),
    [data.nodes],
  );

  if (data.nodes.length === 0) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--admin-text-dim)', fontSize: 13,
      }}>
        Нет данных за выбранный период
      </div>
    );
  }

  return (
    <div style={{ height, background: '#fafaff', borderRadius: 12 }}>
      <ForceGraph2D
        graphData={data}
        nodeRelSize={6}
        nodeVal={(n) => 4 + ((n as { size: number }).size / maxSize) * 14}
        nodeColor={(n) => GROUP_COLOR[(n as { group: GraphData['nodes'][number]['group'] }).group]}
        linkColor={() => 'rgba(99, 102, 241, 0.25)'}
        linkWidth={(l) => Math.max(1, Math.log10(((l as { value: number }).value) + 1))}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        nodeLabel={(n) => `${(n as { id: string }).id} · ${(n as { size: number }).size}`}
        cooldownTicks={120}
      />
    </div>
  );
}
