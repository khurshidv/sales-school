'use client';
import { useMemo, useState } from 'react';
import type { DropoffTrendPoint } from '@/lib/admin/api';

export interface DropoffTrendChartProps {
  points: DropoffTrendPoint[];
  height?: number;
}

export function DropoffTrendChart({ points, height = 200 }: DropoffTrendChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const data = useMemo(() => [...points].sort((a, b) => a.bucket_date.localeCompare(b.bucket_date)), [points]);
  if (data.length === 0) {
    return <div style={{ padding: 20, color: 'var(--admin-text-dim)', fontSize: 13 }}>Нет данных за период</div>;
  }
  const max = Math.max(0.05, ...data.map(d => d.rate));
  const padX = 20, padY = 20, W = 720, H = height;
  const plotW = W - padX * 2, plotH = H - padY * 2;
  const step = data.length > 1 ? plotW / (data.length - 1) : 0;
  const toXY = (i: number, v: number) => ({ x: padX + step * i, y: padY + plotH - (v / max) * plotH });
  const pts = data.map((d, i) => { const { x, y } = toXY(i, d.rate); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ');

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (step === 0) { setHoverIdx(0); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((px - padX) / step);
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  };

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
        <polyline points={pts} fill="none" stroke="var(--admin-accent-danger)" strokeWidth={2} />
        {hoverIdx !== null && (() => {
          const p = data[hoverIdx];
          const { x, y } = toXY(hoverIdx, p.rate);
          return (
            <g>
              <line x1={x} y1={padY} x2={x} y2={padY + plotH} stroke="var(--admin-border)" strokeDasharray="4 3" />
              <circle cx={x} cy={y} r={4} fill="var(--admin-accent-danger)" />
            </g>
          );
        })()}
      </svg>
      {hoverIdx !== null && (() => {
        const p = data[hoverIdx];
        return (
          <div style={{ fontSize: 11, color: 'var(--admin-text)', marginTop: 6, display: 'flex', gap: 12 }}>
            <strong>{p.bucket_date}</strong>
            <span>Drop-off: <strong>{(p.rate * 100).toFixed(1)}%</strong></span>
            <span>{p.dropped}/{p.entered}</span>
          </div>
        );
      })()}
    </div>
  );
}
