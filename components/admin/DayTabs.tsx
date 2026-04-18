'use client';

import { DAYS } from '@/lib/admin/types-v2';

export interface DayTabsProps {
  value: string;
  onChange: (id: string) => void;
}

export default function DayTabs({ value, onChange }: DayTabsProps) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {DAYS.map((d) => (
        <button
          key={d.id}
          onClick={() => onChange(d.id)}
          className={value === d.id ? 'admin-btn admin-btn-primary' : 'admin-btn'}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
