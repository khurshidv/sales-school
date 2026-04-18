'use client';

import type { Period } from '@/lib/admin/types-v2';

const OPTIONS: Array<{ id: Period; label: string }> = [
  { id: '7d', label: '7 дней' },
  { id: '30d', label: '30 дней' },
  { id: '90d', label: '90 дней' },
  { id: 'all', label: 'Всё время' },
];

export interface PeriodFilterProps {
  value: Period;
  onChange: (p: Period) => void;
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Period)}
      className="admin-btn"
      style={{ paddingRight: 28 }}
    >
      {OPTIONS.map((o) => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
  );
}
