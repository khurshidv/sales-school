'use client';

import type { NodeStat } from '@/lib/admin/types-v2';
import { THRESHOLDS } from '@/lib/admin/thresholds';

export interface ThinkingBarChartProps {
  stats: NodeStat[];
  labels?: Record<string, { title: string; preview?: string | null }>;
  limit?: number;
}

export default function ThinkingBarChart({ stats, labels, limit = 20 }: ThinkingBarChartProps) {
  const rows = [...stats]
    .filter(s => s.avg_thinking_time_ms > 0)
    .sort((a, b) => b.avg_thinking_time_ms - a.avg_thinking_time_ms)
    .slice(0, limit);

  if (rows.length === 0) {
    return (
      <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 12 }}>
        Нет данных
      </div>
    );
  }

  const max = Math.max(...rows.map(r => r.avg_thinking_time_ms));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {rows.map(r => {
        const seconds = r.avg_thinking_time_ms / 1000;
        const pct = (r.avg_thinking_time_ms / max) * 100;
        const isSlow = r.avg_thinking_time_ms >= THRESHOLDS.engagement.slowNodeMs;
        const color = isSlow ? 'var(--admin-accent-danger)' : 'var(--admin-accent-violet)';
        const label = labels?.[r.node_id];
        const title = label?.title ?? r.node_id;
        return (
          <div
            key={r.node_id}
            style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8, alignItems: 'center', fontSize: 11 }}
          >
            <div
              title={label?.preview ?? r.node_id}
              style={{
                position: 'relative', height: 22, background: 'var(--admin-bg-2)',
                borderRadius: 4, overflow: 'hidden',
              }}
            >
              <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
              <span style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--admin-text)', fontWeight: 600, whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 'calc(100% - 16px)',
              }}>{title}</span>
            </div>
            <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-text)' }}>
              {seconds.toFixed(1)}с
            </div>
          </div>
        );
      })}
    </div>
  );
}
