import type { ReactNode } from 'react';

type KpiAccent = 'violet' | 'pink' | 'green' | 'orange' | 'blue';

const ACCENTS: Record<KpiAccent, { label: string; shadow: string }> = {
  violet: { label: '#6366f1', shadow: 'rgba(99, 102, 241, 0.06)' },
  pink:   { label: '#ec4899', shadow: 'rgba(236, 72, 153, 0.06)' },
  green:  { label: '#10b981', shadow: 'rgba(16, 185, 129, 0.06)' },
  orange: { label: '#fb923c', shadow: 'rgba(251, 146, 60, 0.06)' },
  blue:   { label: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.06)' },
};

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  accent?: KpiAccent;
}

export default function KpiCard({ label, value, delta, hint, accent = 'violet' }: KpiCardProps) {
  const { label: labelColor, shadow } = ACCENTS[accent];
  return (
    <div
      className="admin-card"
      style={{ boxShadow: `0 4px 12px ${shadow}` }}
    >
      <div style={{ fontSize: 9, color: labelColor, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--admin-text)', marginTop: 4 }}>
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 10, color: delta.positive ? 'var(--admin-accent-success)' : 'var(--admin-accent-danger)', marginTop: 2 }}>
          {delta.positive ? '↑' : '↓'} {delta.value}
        </div>
      )}
      {hint && (
        <div style={{ fontSize: 9, color: 'var(--admin-text-dim)', marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}
