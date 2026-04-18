'use client';

import RatingBadge from '@/components/admin/RatingBadge';
import type { CompletedDay } from '@/lib/admin/types-v2';

export interface PerDayBarsProps {
  days: CompletedDay[];
  maxDays?: number;
}

const TARGET_SCORE = 100;

export default function PerDayBars({ days, maxDays = 5 }: PerDayBarsProps) {
  const slots = Array.from({ length: maxDays }, (_, i) => `day${i + 1}`);
  const byDay = new Map(days.map((d) => [d.day_id, d]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {slots.map((dayId) => {
        const d = byDay.get(dayId);
        const widthPct = d ? Math.min(100, (d.score / TARGET_SCORE) * 100) : 0;
        const color = d
          ? d.rating === 'S' ? '#f59e0b'
          : d.rating === 'A' ? '#10b981'
          : d.rating === 'B' ? '#3b82f6'
          : d.rating === 'C' ? '#fb923c'
          : '#ef4444'
          : '#94a3b8';
        return (
          <div key={dayId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 60, fontSize: 11, color: 'var(--admin-text-muted)' }}>
              {dayId.replace('day', 'День ')}
            </div>
            <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${widthPct}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
            </div>
            <div style={{ width: 90, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
              {d ? (
                <>
                  <span style={{ fontSize: 11, color: 'var(--admin-text)', fontWeight: 600 }}>{d.score}</span>
                  <RatingBadge rating={d.rating} size="sm" />
                </>
              ) : (
                <span style={{ fontSize: 10, color: 'var(--admin-text-dim)' }}>не начат</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
