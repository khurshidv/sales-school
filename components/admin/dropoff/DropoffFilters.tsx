export type DayFilter = 'all' | string;
export type NodeTypeFilter = 'all' | 'dialogue' | 'choice';

const DAY_OPTIONS: Array<{ id: DayFilter; label: string }> = [
  { id: 'all', label: 'Все дни' },
  { id: 'car-day1', label: 'День 1' },
  { id: 'car-day2', label: 'День 2' },
  { id: 'car-day3', label: 'День 3' },
];

const TYPE_OPTIONS: Array<{ id: NodeTypeFilter; label: string }> = [
  { id: 'all', label: 'Все типы' },
  { id: 'dialogue', label: 'Диалог' },
  { id: 'choice', label: 'Выбор' },
];

export interface DropoffFiltersProps {
  day: DayFilter;
  nodeType: NodeTypeFilter;
  onDayChange: (d: DayFilter) => void;
  onNodeTypeChange: (t: NodeTypeFilter) => void;
}

export function DropoffFilters({ day, nodeType, onDayChange, onNodeTypeChange }: DropoffFiltersProps) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
      <Group options={DAY_OPTIONS} value={day} onChange={onDayChange} />
      <Group options={TYPE_OPTIONS} value={nodeType} onChange={onNodeTypeChange} />
    </div>
  );
}

function Group<T extends string>({ options, value, onChange }: {
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{
      display: 'inline-flex', background: 'var(--admin-bg-2)',
      border: '1px solid var(--admin-border)', borderRadius: 8, padding: 2,
    }}>
      {options.map(opt => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            style={{
              padding: '6px 10px', fontSize: 11, fontWeight: 600,
              border: 'none', borderRadius: 6, cursor: 'pointer',
              background: active ? 'var(--admin-bg)' : 'transparent',
              color: active ? 'var(--admin-text)' : 'var(--admin-text-muted)',
            }}
          >{opt.label}</button>
        );
      })}
    </div>
  );
}
