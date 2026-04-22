'use client';

import type { Period } from '@/lib/admin/types-v2';
import type { PeriodParamState } from '@/lib/admin/usePeriodParam';

const OPTIONS: Array<{ id: Period; label: string }> = [
  { id: 'today', label: 'Сегодня' },
  { id: 'yesterday', label: 'Вчера' },
  { id: '7d', label: '7 дней' },
  { id: '30d', label: '30 дней' },
  { id: '90d', label: '90 дней' },
  { id: 'all', label: 'Всё время' },
  { id: 'custom', label: 'Свой диапазон' },
];

export interface PeriodFilterProps {
  value: PeriodParamState;
  onChange: (p: PeriodParamState) => void;
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  function handlePeriod(next: Period) {
    if (next === 'custom') {
      if (!value.from || !value.to) {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 6);
        onChange({
          period: 'custom',
          from: weekAgo.toISOString().slice(0, 10),
          to: today.toISOString().slice(0, 10),
        });
      } else {
        onChange({ ...value, period: 'custom' });
      }
      return;
    }
    onChange({ period: next, from: null, to: null });
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <select
        value={value.period}
        onChange={(e) => handlePeriod(e.target.value as Period)}
        className="admin-btn"
        style={{ paddingRight: 28 }}
      >
        {OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
      {value.period === 'custom' && (
        <>
          <input
            type="date"
            value={value.from ?? ''}
            onChange={(e) => onChange({ ...value, period: 'custom', from: e.target.value || null })}
            className="admin-btn"
            aria-label="От"
            style={{ padding: '8px 10px' }}
          />
          <span style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>—</span>
          <input
            type="date"
            value={value.to ?? ''}
            onChange={(e) => onChange({ ...value, period: 'custom', to: e.target.value || null })}
            className="admin-btn"
            aria-label="До"
            style={{ padding: '8px 10px' }}
          />
        </>
      )}
    </div>
  );
}
