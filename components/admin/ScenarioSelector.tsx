'use client';

import { SCENARIOS } from '@/lib/admin/types-v2';

export interface ScenarioSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

export default function ScenarioSelector({ value, onChange }: ScenarioSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="admin-btn"
      style={{ paddingRight: 28 }}
    >
      {SCENARIOS.map((s) => (
        <option key={s.id} value={s.id}>{s.label}</option>
      ))}
    </select>
  );
}
