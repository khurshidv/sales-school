'use client';
import { useMemo, useState } from 'react';
import { computeInterestIndex } from '@/lib/admin/engagement/computeIndex';
import type { EngagementTrendRow } from '@/lib/admin/api';

export interface InterestTrendChartProps {
  points: EngagementTrendRow[];
  height?: number;
}

const COLOR = '#6366f1';

export function InterestTrendChart({ points, height = 200 }: InterestTrendChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const data = useMemo(() => {
    const sorted = [...points].sort((a, b) => a.bucket_date.localeCompare(b.bucket_date));
    return sorted.map(p => {
      // replay_rate is not available from get_engagement_trend RPC.
      // 0.15 is the midpoint of the healthy range (0.10–0.30) — a neutral placeholder.
      // The dashboard note below the chart explains this.
      const idx = computeInterestIndex({
        completion_rate: p.completion_rate,
        avg_thinking_time_ms: p.avg_thinking_ms,
        replay_rate: 0.15,
      });
      return { ...p, score: idx.score };
    });
  }, [points]);

  if (data.length === 0) {
    return <div style={{ padding: 20, color: 'var(--admin-text-dim)', fontSize: 13 }}>Нет данных за период</div>;
  }

  const padX = 20, padY = 20, W = 720, H = height;
  const plotW = W - padX * 2, plotH = H - padY * 2;
  const step = data.length > 1 ? plotW / (data.length - 1) : 0;
  const toY = (score: number) => padY + plotH - (score / 10) * plotH;
  const pts = data.map((d, i) => `${(padX + step * i).toFixed(1)},${toY(d.score).toFixed(1)}`).join(' ');

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (step === 0) { setHoverIdx(0); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    setHoverIdx(Math.max(0, Math.min(data.length - 1, Math.round((px - padX) / step))));
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
        <line x1={padX} y1={toY(5)} x2={W - padX} y2={toY(5)} stroke="var(--admin-border)" strokeDasharray="3 3" />
        <polyline points={pts} fill="none" stroke={COLOR} strokeWidth={2} />
        {hoverIdx !== null && (() => {
          const d = data[hoverIdx];
          const x = padX + step * hoverIdx;
          const y = toY(d.score);
          return (
            <g>
              <line x1={x} y1={padY} x2={x} y2={padY + plotH} stroke="var(--admin-border)" strokeDasharray="4 3" />
              <circle cx={x} cy={y} r={4} fill={COLOR} />
            </g>
          );
        })()}
      </svg>
      {hoverIdx !== null && (() => {
        const d = data[hoverIdx];
        return (
          <div style={{ fontSize: 11, color: 'var(--admin-text)', marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <strong>{d.bucket_date}</strong>
            <span>Interest: <strong>{d.score.toFixed(1)}/10</strong></span>
            <span>Старт/Фин: <strong>{d.started}/{d.completed}</strong></span>
          </div>
        );
      })()}
    </div>
  );
}
