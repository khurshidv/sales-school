'use client';

const EVENT_GROUPS: Array<{ id: string; label: string; types: string[] }> = [
  { id: 'all',       label: 'Всё',        types: [] },
  { id: 'progress',  label: 'Прогресс',   types: ['day_started', 'day_completed', 'day_failed', 'game_started', 'game_completed'] },
  { id: 'choices',   label: 'Выборы',     types: ['choice_made', 'back_navigation'] },
  { id: 'drops',     label: 'Уходы',      types: ['dropped_off', 'idle_detected'] },
  { id: 'system',    label: 'Служебные',  types: ['heartbeat', 'node_entered', 'node_exited'] },
];

export const EVENT_GROUP_TYPES: Record<string, string[]> = Object.fromEntries(
  EVENT_GROUPS.map(g => [g.id, g.types])
);

export function EventFilter({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
      {EVENT_GROUPS.map(g => {
        const isActive = active === g.id;
        return (
          <button
            key={g.id}
            onClick={() => onChange(g.id)}
            style={{
              padding: '4px 10px', fontSize: 10, fontWeight: 600,
              border: '1px solid var(--admin-border)', borderRadius: 12, cursor: 'pointer',
              background: isActive ? 'var(--admin-accent-violet)' : 'var(--admin-bg-2)',
              color: isActive ? 'white' : 'var(--admin-text-muted)',
            }}
          >
            {g.label}
          </button>
        );
      })}
    </div>
  );
}
