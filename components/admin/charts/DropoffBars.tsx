'use client';

import type { DropoffRow } from '@/lib/admin/types-v2';

export interface DropoffBarsProps {
  rows: DropoffRow[];
}

const COLORS = ['#ef4444', '#f59e0b', '#fb923c'];

/**
 * Custom CSS bars (no chart library) — list view of top drop-off zones.
 * Bar width = proportional to top row's dropoff_count.
 */
export default function DropoffBars({ rows }: DropoffBarsProps) {
  if (rows.length === 0) {
    return (
      <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>
        Нет drop-off за выбранный период — игроки доходят до конца.
      </div>
    );
  }
  const max = Math.max(...rows.map((r) => r.dropoff_count));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r, i) => {
        const widthPct = (r.dropoff_count / max) * 100;
        const color = COLORS[Math.min(i, COLORS.length - 1)];
        return (
          <div key={`${r.node_id}-${r.day_id}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text)', marginBottom: 4 }}>
                {r.day_id} · <span style={{ fontFamily: 'ui-monospace, monospace' }}>{r.node_id}</span>
              </div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${widthPct}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color, minWidth: 40, textAlign: 'right' }}>
              {r.dropoff_count}
            </div>
          </div>
        );
      })}
    </div>
  );
}
