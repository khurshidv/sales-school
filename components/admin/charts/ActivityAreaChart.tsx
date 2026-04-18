'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ActivityBucket } from '@/lib/admin/realtime/buildActivitySeries';

export interface ActivityAreaChartProps {
  buckets: ActivityBucket[];
  height?: number;
}

export default function ActivityAreaChart({ buckets, height = 220 }: ActivityAreaChartProps) {
  if (buckets.length === 0 || buckets.every((b) => b.count === 0)) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--admin-text-dim)', fontSize: 13,
      }}>
        Нет активности за последний час
      </div>
    );
  }
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={buckets} margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
          <defs>
            <linearGradient id="activityGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="bucket" tick={{ fontSize: 9 }} interval={9} />
          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
          <Tooltip formatter={(v: number) => [`${v} игроков`, 'Активность']} />
          <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#activityGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
