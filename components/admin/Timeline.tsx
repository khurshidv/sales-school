'use client';

import type { ReactNode } from 'react';

export type TimelineTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const TONES: Record<TimelineTone, { dotBg: string; dotRing: string }> = {
  info:    { dotBg: '#3b82f6', dotRing: '#dbeafe' },
  success: { dotBg: '#22c55e', dotRing: '#dcfce7' },
  warning: { dotBg: '#f59e0b', dotRing: '#fef3c7' },
  danger:  { dotBg: '#ef4444', dotRing: '#fee2e2' },
  neutral: { dotBg: '#94a3b8', dotRing: '#f1f5f9' },
};

export interface TimelineItem {
  id: string;
  title: ReactNode;
  meta?: ReactNode;
  timestamp: string;
  tone?: TimelineTone;
}

export interface TimelineProps {
  items: TimelineItem[];
  emptyText?: string;
}

export default function Timeline({ items, emptyText = 'Нет событий' }: TimelineProps) {
  if (items.length === 0) {
    return <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>{emptyText}</div>;
  }
  return (
    <div style={{ position: 'relative', paddingLeft: 20 }}>
      <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: '#e2e8f0' }} />
      {items.map((item) => {
        const tone = TONES[item.tone ?? 'neutral'];
        return (
          <div key={item.id} style={{ position: 'relative', padding: '8px 0' }}>
            <div
              style={{
                position: 'absolute', left: -19, top: 11,
                width: 14, height: 14, borderRadius: '50%',
                background: tone.dotBg,
                border: `3px solid ${tone.dotRing}`,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text)' }}>
                  {item.title}
                </div>
                {item.meta && (
                  <div style={{ fontSize: 10, color: 'var(--admin-text-muted)', marginTop: 2 }}>
                    {item.meta}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 9, color: 'var(--admin-text-dim)', whiteSpace: 'nowrap' }}>
                {item.timestamp}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
