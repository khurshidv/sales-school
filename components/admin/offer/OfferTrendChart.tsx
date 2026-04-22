'use client';

import { useMemo } from 'react';
import type { OfferTrendRow } from '@/lib/admin/api';

interface Props {
  rows: OfferTrendRow[];
}

const W = 640;
const H = 200;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 28;

function fmtDate(s: string): string {
  const d = new Date(s);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

export function OfferTrendChart({ rows }: Props) {
  const { ctrPath, crPath, yMax, points, labels } = useMemo(() => {
    if (rows.length === 0) return { ctrPath: '', crPath: '', yMax: 100, points: [], labels: [] };
    const yMax = Math.max(10, ...rows.map(r => Math.max(r.ctr, r.cr))) * 1.1;
    const xStep = rows.length > 1 ? (W - PAD_L - PAD_R) / (rows.length - 1) : 0;
    const yScale = (v: number) => H - PAD_B - ((v / yMax) * (H - PAD_T - PAD_B));
    const pts = rows.map((r, i) => ({
      x: PAD_L + i * xStep,
      yCtr: yScale(r.ctr),
      yCr: yScale(r.cr),
      day: r.day,
      ctr: r.ctr,
      cr: r.cr,
    }));
    const ctrPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yCtr.toFixed(1)}`).join(' ');
    const crPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yCr.toFixed(1)}`).join(' ');
    // show up to ~8 x-axis labels
    const stride = Math.max(1, Math.ceil(rows.length / 8));
    const labels = pts.filter((_, i) => i % stride === 0).map(p => ({ x: p.x, day: fmtDate(p.day) }));
    return { ctrPath, crPath, yMax, points: pts, labels };
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>
        Нет данных за период
      </div>
    );
  }

  // y-axis ticks: 0, 25, 50, 75, yMax (rounded)
  const ticks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax];
  const yScale = (v: number) => H - PAD_B - ((v / yMax) * (H - PAD_T - PAD_B));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', maxHeight: 240 }}>
        {/* y grid + labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={W - PAD_R} y1={yScale(t)} y2={yScale(t)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={PAD_L - 6} y={yScale(t) + 3} fontSize={10} fill="#94a3b8" textAnchor="end">
              {t.toFixed(0)}%
            </text>
          </g>
        ))}
        {/* x labels */}
        {labels.map((l, i) => (
          <text key={i} x={l.x} y={H - PAD_B + 14} fontSize={10} fill="#94a3b8" textAnchor="middle">{l.day}</text>
        ))}
        {/* CTR line (blue) */}
        <path d={ctrPath} fill="none" stroke="#3b82f6" strokeWidth={2} />
        {/* CR line (green) */}
        <path d={crPath} fill="none" stroke="#10b981" strokeWidth={2} />
        {/* dots with tooltips */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.yCtr} r={2} fill="#3b82f6" />
            <circle cx={p.x} cy={p.yCr} r={2} fill="#10b981" />
            <title>{`${fmtDate(p.day)} — CTR ${p.ctr.toFixed(1)}%, CR ${p.cr.toFixed(1)}%`}</title>
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 8 }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#3b82f6', borderRadius: 2, marginRight: 6 }} />CTR</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#10b981', borderRadius: 2, marginRight: 6 }} />CR</span>
      </div>
    </div>
  );
}
