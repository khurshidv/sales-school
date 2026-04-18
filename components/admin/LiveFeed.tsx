'use client';

import type { RecentGameEvent } from '@/lib/admin/queries-v2';

export interface LiveFeedProps {
  events: RecentGameEvent[];
  maxItems?: number;
}

const DOT_COLOR: Record<string, string> = {
  game_started: '#22c55e',
  day_started: '#3b82f6',
  day_completed: '#10b981',
  day_failed: '#ef4444',
  choice_made: '#8b5cf6',
  back_navigation: '#f59e0b',
  heartbeat: '#94a3b8',
  game_completed: '#10b981',
  achievement_unlocked: '#f59e0b',
};

const EVENT_TEXT: Record<string, string> = {
  game_started: 'начал игру',
  day_started: 'начал день',
  day_completed: 'завершил день',
  day_failed: 'провалил день',
  choice_made: 'сделал выбор',
  back_navigation: 'шаг назад',
  heartbeat: 'активен',
  game_completed: 'завершил игру',
  achievement_unlocked: 'получил достижение',
  node_entered: 'на узле',
  node_exited: 'покинул узел',
  dropped_off: 'покинул игру',
  idle_detected: 'неактивен',
};

function fmt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function shortPlayerLabel(e: RecentGameEvent): string {
  return e.display_name ?? e.player_id.slice(0, 8);
}

export default function LiveFeed({ events, maxItems = 30 }: LiveFeedProps) {
  if (events.length === 0) {
    return (
      <div style={{ color: 'var(--admin-text-dim)', fontSize: 12, padding: 16, textAlign: 'center' }}>
        Жду событий…
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {events.slice(0, maxItems).map((e, i) => {
        const color = DOT_COLOR[e.event_type] ?? '#cbd5e1';
        const label = EVENT_TEXT[e.event_type] ?? e.event_type;
        const dayHint = e.day_id ? ` · ${e.day_id}` : '';
        return (
          <div
            key={`${e.created_at}-${e.player_id}-${i}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 6px', fontSize: 11,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong>{shortPlayerLabel(e)}</strong> {label}{dayHint}
            </span>
            <span style={{ color: 'var(--admin-text-dim)', fontSize: 10, fontFamily: 'ui-monospace, monospace' }}>{fmt(e.created_at)}</span>
          </div>
        );
      })}
    </div>
  );
}
