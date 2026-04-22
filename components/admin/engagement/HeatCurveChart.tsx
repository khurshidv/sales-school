'use client';

import { useMemo, useState } from 'react';
import type { NodeStat } from '@/lib/admin/types-v2';

export interface HeatCurveChartProps {
  stats: NodeStat[];
  labels?: Record<string, { title: string }>;
  height?: number;
}

export function HeatCurveChart({ stats, labels, height = 180 }: HeatCurveChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const data = useMemo(() => {
    return [...stats]
      .filter(s => s.entered_count > 0)
      .sort((a, b) => b.entered_count - a.entered_count);
  }, [stats]);

  if (data.length === 0) {
    return (
      <div style={{ padding: 20, color: 'var(--admin-text-dim)', fontSize: 13 }}>
        Нет данных
      </div>
    );
  }

  const max = data[0].entered_count;
  const padX = 16, padY = 14, W = 720, H = height;
  const plotW = W - padX * 2, plotH = H - padY * 2;
  const step = data.length > 1 ? plotW / (data.length - 1) : 0;

  const toXY = (i: number, v: number) => ({
    x: padX + step * i,
    y: padY + plotH - (v / max) * plotH,
  });

  const linePoints = data.map((d, i) => {
    const { x, y } = toXY(i, d.entered_count);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const lastX = (padX + step * (data.length - 1)).toFixed(1);
  const area = `M ${padX},${padY + plotH} L ${linePoints.replace(/ /g, ' L ')} L ${lastX},${padY + plotH} Z`;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (step === 0) { setHoverIdx(0); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    setHoverIdx(Math.max(0, Math.min(data.length - 1, Math.round((px - padX) / step))));
  };

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div>
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIdx(null)}
        style={{ display: 'block' }}
      >
        <path d={area} fill="rgba(99, 102, 241, 0.18)" />
        <polyline points={linePoints} fill="none" stroke="#6366f1" strokeWidth={2} />
        {hoverIdx !== null && (() => {
          const d = data[hoverIdx];
          const { x, y } = toXY(hoverIdx, d.entered_count);
          return (
            <g>
              <line
                x1={x} y1={padY} x2={x} y2={padY + plotH}
                stroke="var(--admin-border)" strokeDasharray="4 3"
              />
              <circle cx={x} cy={y} r={4} fill="#6366f1" />
            </g>
          );
        })()}
      </svg>
      {hovered && (
        <div style={{ fontSize: 11, color: 'var(--admin-text)', marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <strong>{labels?.[hovered.node_id]?.title ?? hovered.node_id}</strong>
          <span>Посещений: <strong>{hovered.entered_count}</strong></span>
        </div>
      )}
    </div>
  );
}
