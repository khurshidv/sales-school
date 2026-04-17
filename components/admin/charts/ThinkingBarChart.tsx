'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { NodeStat } from '@/lib/admin/types-v2';

export interface ThinkingBarChartProps {
  stats: NodeStat[];
  height?: number;
}

const SUSPECT_MS = 15_000;
const ALARMING_MS = 25_000;

export default function ThinkingBarChart({ stats, height = 280 }: ThinkingBarChartProps) {
  if (stats.length === 0) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--admin-text-dim)', fontSize: 13,
      }}>
        Нет данных за выбранный период
      </div>
    );
  }
  const data = stats
    .filter((s) => s.avg_thinking_time_ms > 0)
    .sort((a, b) => b.avg_thinking_time_ms - a.avg_thinking_time_ms)
    .slice(0, 20)
    .map((s) => ({ node: s.node_id, value: Math.round(s.avg_thinking_time_ms / 1000) }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 32, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="node" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 10 }} unit="с" />
          <Tooltip formatter={(v: number) => [`${v}с`, 'Среднее время']} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => {
              const ms = d.value * 1000;
              const fill = ms >= ALARMING_MS ? '#ef4444' : ms >= SUSPECT_MS ? '#f59e0b' : '#10b981';
              return <Cell key={i} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
