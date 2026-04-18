'use client';

import type { FunnelStep } from '@/lib/admin/types-v2';

export interface FunnelBarsProps {
  steps: FunnelStep[];
}

const COLORS = ['#8b5cf6', '#a78bfa', '#ec4899', '#f472b6', '#10b981'];

/**
 * CSS-only horizontal bars for a marketing funnel. Each row shows the
 * absolute count, the % retained from the previous step, and the % of
 * top funnel reach. Width is proportional to pctOfTop.
 */
export default function FunnelBars({ steps }: FunnelBarsProps) {
  if (steps.length === 0) {
    return (
      <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>
        Нет данных за выбранный период
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {steps.map((s, i) => {
        const color = COLORS[Math.min(i, COLORS.length - 1)];
        return (
          <div key={s.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text)' }}>
                {s.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                <strong style={{ color: 'var(--admin-text)' }}>
                  {s.value.toLocaleString('ru-RU')}
                </strong>
                {i > 0 && (
                  <> · <span style={{ color: s.pctOfPrev < 50 ? 'var(--admin-accent-warn)' : 'var(--admin-accent-success)' }}>
                    {s.pctOfPrev.toFixed(0)}% от пред.
                  </span></>
                )}
              </div>
            </div>
            <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.max(2, s.pctOfTop)}%`,
                  height: '100%',
                  background: color,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
