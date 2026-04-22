'use client';

export const LEAD_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: 'Новый', bg: '#dbeafe', color: '#1e40af' },
  in_progress: { label: 'В работе', bg: '#fef3c7', color: '#92400e' },
  done: { label: 'Готово', bg: '#dcfce7', color: '#166534' },
  invalid: { label: 'Негодный', bg: '#fee2e2', color: '#991b1b' },
};

export const LEAD_STATUS_ORDER = ['new', 'in_progress', 'done', 'invalid'] as const;

export function LeadStatusBadge({ status }: { status: string }) {
  const c = LEAD_STATUS_CONFIG[status] ?? LEAD_STATUS_CONFIG.new;
  return (
    <span style={{
      display: 'inline-block',
      background: c.bg,
      color: c.color,
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  );
}
