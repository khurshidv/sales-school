import type { UtmDimension } from '@/lib/admin/api';

const LABELS: Record<UtmDimension, string> = {
  utm_source: 'Источник',
  utm_medium: 'Канал',
  utm_campaign: 'Кампания',
};

const ORDER: UtmDimension[] = ['utm_source', 'utm_medium', 'utm_campaign'];

export interface DimensionSelectorProps {
  value: UtmDimension;
  onChange: (next: UtmDimension) => void;
}

export function DimensionSelector({ value, onChange }: DimensionSelectorProps) {
  return (
    <div style={{
      display: 'inline-flex', background: 'var(--admin-bg-2)',
      border: '1px solid var(--admin-border)', borderRadius: 8, padding: 2,
    }}>
      {ORDER.map(d => {
        const active = d === value;
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            style={{
              padding: '6px 12px', fontSize: 11, fontWeight: 600,
              border: 'none', borderRadius: 6, cursor: 'pointer',
              background: active ? 'var(--admin-bg)' : 'transparent',
              color: active ? 'var(--admin-text)' : 'var(--admin-text-muted)',
              boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            {LABELS[d]}
          </button>
        );
      })}
    </div>
  );
}
