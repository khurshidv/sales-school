'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DailyTrendRow } from '@/lib/admin/types-v2';

export interface TrendLineChartProps {
  rows: DailyTrendRow[];
  height?: number;
}

export default function TrendLineChart({ rows, height = 280 }: TrendLineChartProps) {
  if (rows.length === 0) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--admin-text-dim)', fontSize: 13,
      }}>
        Нет данных за выбранный период
      </div>
    );
  }
  const data = rows.map((r) => ({
    date: r.bucket_date.slice(5),
    'Регистраций': r.registered,
    'Начали игру': r.game_started,
    'Завершили': r.game_completed,
  }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="Регистраций" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Начали игру" stroke="#ec4899" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Завершили" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
