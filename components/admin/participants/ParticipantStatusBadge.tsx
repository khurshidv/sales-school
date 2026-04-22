'use client';

export const PARTICIPANT_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  new: { label: 'Новый', bg: '#dbeafe', color: '#1e40af' },
  in_progress: { label: 'В работе', bg: '#fef3c7', color: '#92400e' },
  done: { label: 'Готово', bg: '#dcfce7', color: '#166534' },
  hire: { label: 'Нанять', bg: '#ede9fe', color: '#6d28d9' },
  skip: { label: 'Пропустить', bg: '#f1f5f9', color: '#475569' },
};

export const PARTICIPANT_STATUS_ORDER = [
  'new',
  'in_progress',
  'done',
  'hire',
  'skip',
] as const;

export function ParticipantStatusBadge({ status }: { status: string }) {
  const c = PARTICIPANT_STATUS_CONFIG[status] ?? PARTICIPANT_STATUS_CONFIG.new;
  return (
    <span
      style={{
        display: 'inline-block',
        background: c.bg,
        color: c.color,
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {c.label}
    </span>
  );
}
