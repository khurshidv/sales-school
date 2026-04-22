'use client';
import { useMemo, useState } from 'react';
import type { DailyTrendRow } from '@/lib/admin/types-v2';

export interface DualTrendChartProps {
  rows: DailyTrendRow[];
  height?: number;
}

const COLOR_REG = '#6366f1';
const COLOR_COMP = '#10b981';

export function DualTrendChart({ rows, height = 260 }: DualTrendChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const data = useMemo(() => {
    return [...rows].sort((a, b) => a.bucket_date.localeCompare(b.bucket_date));
  }, [rows]);

  if (data.length === 0) {
    return <div style={{ padding: 20, color: 'var(--admin-text-dim)', fontSize: 13 }}>Нет данных за период</div>;
  }

  const max = Math.max(1, ...data.map(d => Math.max(d.registered, d.game_completed)));
  const padX = 20, padY = 20;
  const W = 800, H = height;
  const plotW = W - padX * 2, plotH = H - padY * 2;
  const step = data.length > 1 ? plotW / (data.length - 1) : 0;

  const toXY = (i: number, v: number) => ({
    x: padX + step * i,
    y: padY + plotH - (v / max) * plotH,
  });

  const pts = (key: 'registered' | 'game_completed') =>
    data.map((d, i) => {
      const { x, y } = toXY(i, d[key]);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

  const totalReg = data.reduce((a, d) => a + d.registered, 0);
  const totalComp = data.reduce((a, d) => a + d.game_completed, 0);

  // X-axis tick indices: start, middle, end
  const tickIndices = data.length <= 2
    ? data.map((_, i) => i)
    : [0, Math.floor((data.length - 1) / 2), data.length - 1];

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const rel = px - padX;
    if (step === 0) { setHoverIdx(0); return; }
    const idx = Math.round(rel / step);
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--admin-text-muted)', marginBottom: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 10, height: 2, background: COLOR_REG, borderRadius: 2 }} />
          Регистрации ({totalReg.toLocaleString('ru-RU')})
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 10, height: 2, background: COLOR_COMP, borderRadius: 2 }} />
          Прохождения ({totalComp.toLocaleString('ru-RU')})
        </span>
      </div>
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIdx(null)}
        style={{ display: 'block' }}
      >
        {/* Date ticks */}
        {tickIndices.map((ti) => {
          const x = padX + step * ti;
          return (
            <text
              key={ti}
              x={x}
              y={H - 4}
              textAnchor="middle"
              fontSize={9}
              fill="var(--admin-text-dim)"
            >
              {data[ti].bucket_date.slice(5)}
            </text>
          );
        })}

        <polyline points={pts('registered')} fill="none" stroke={COLOR_REG} strokeWidth={2} strokeLinejoin="round" />
        <polyline points={pts('game_completed')} fill="none" stroke={COLOR_COMP} strokeWidth={2} strokeLinejoin="round" />

        {hoverIdx !== null && (() => {
          const d = data[hoverIdx];
          const rx = toXY(hoverIdx, d.registered);
          const cx = toXY(hoverIdx, d.game_completed);
          return (
            <g>
              <line
                x1={rx.x} y1={padY} x2={rx.x} y2={padY + plotH}
                stroke="var(--admin-border)" strokeDasharray="4 3" strokeWidth={1}
              />
              <circle cx={rx.x} cy={rx.y} r={4} fill={COLOR_REG} />
              <circle cx={cx.x} cy={cx.y} r={4} fill={COLOR_COMP} />
            </g>
          );
        })()}
      </svg>
      {hoverIdx !== null && (() => {
        const d = data[hoverIdx];
        return (
          <div style={{
            fontSize: 11, color: 'var(--admin-text)', marginTop: 6,
            display: 'flex', gap: 12, flexWrap: 'wrap',
          }}>
            <strong>{d.bucket_date}</strong>
            <span>Регистрации: <strong>{d.registered}</strong></span>
            <span>Прохождения: <strong>{d.game_completed}</strong></span>
          </div>
        );
      })()}
    </div>
  );
}
