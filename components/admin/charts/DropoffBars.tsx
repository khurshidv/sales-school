'use client';

import type { DropoffRateRow, NodeLabelResult } from '@/lib/admin/api';

export interface DropoffBarsProps {
  rows: DropoffRateRow[];
  labels?: Record<string, NodeLabelResult>;
  maxRows?: number;
}

function toneForRate(rate: number): { bg: string; fg: string } {
  if (rate >= 0.30) return { bg: 'var(--admin-accent-danger)', fg: 'white' };
  if (rate >= 0.10) return { bg: 'var(--admin-accent-warn)', fg: 'white' };
  return { bg: 'var(--admin-accent-success)', fg: 'white' };
}

export default function DropoffBars({ rows, labels, maxRows = 50 }: DropoffBarsProps) {
  const data = rows.slice(0, maxRows);
  if (data.length === 0) {
    return (
      <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 12 }}>
        Нет данных за период
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {data.map((r) => {
        const pct = Math.min(100, r.dropoff_rate * 100);
        const label = labels?.[r.node_id];
        const title = label?.title ?? r.node_id;
        const tone = toneForRate(r.dropoff_rate);
        return (
          <div
            key={`${r.day_id}::${r.node_id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 70px 70px',
              gap: 8,
              alignItems: 'center',
              fontSize: 11,
            }}
          >
            <div
              title={label?.preview ?? r.node_id}
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              <span style={{ fontSize: 9, color: 'var(--admin-text-muted)', marginRight: 6 }}>
                {r.day_id}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{title}</span>
            </div>
            <div
              style={{
                position: 'relative',
                height: 20,
                background: 'var(--admin-bg-2)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: tone.bg,
                  transition: 'width 0.3s',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 10,
                  fontWeight: 700,
                  color: tone.fg,
                  textShadow: '0 0 4px rgba(0,0,0,0.3)',
                }}
              >
                {pct.toFixed(1)}%
              </span>
            </div>
            <div style={{ textAlign: 'right', color: 'var(--admin-text-muted)' }}>
              {r.dropoff_count}/{r.entered_count}
            </div>
          </div>
        );
      })}
    </div>
  );
}
