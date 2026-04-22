'use client';

import { useEffect, useState } from 'react';
import { UtmFilter } from '@/components/admin/leads/UtmFilter';

export interface ParticipantFiltersState {
  ratings: string[];
  utmSources: string[];
  utmCampaigns: string[];
  hasLead: boolean | null;
  status: string[];
}

interface Props {
  value: ParticipantFiltersState;
  onChange: (v: ParticipantFiltersState) => void;
}

const RATING_OPTIONS = ['S', 'A', 'B', 'C', 'F'] as const;

const STATUS_OPTIONS: Array<{ id: string; label: string }> = [
  { id: 'new', label: 'Новый' },
  { id: 'in_progress', label: 'В работе' },
  { id: 'done', label: 'Готово' },
  { id: 'hire', label: 'Нанять' },
  { id: 'skip', label: 'Пропустить' },
];

export function ParticipantFilters({ value, onChange }: Props) {
  const [utmOptions, setUtmOptions] = useState<{ sources: string[]; campaigns: string[] }>({
    sources: [],
    campaigns: [],
  });

  useEffect(() => {
    fetch('/api/admin/participants/filters')
      .then((r) => (r.ok ? r.json() : { sources: [], campaigns: [] }))
      .then((d: { sources?: string[]; campaigns?: string[] }) =>
        setUtmOptions({ sources: d.sources ?? [], campaigns: d.campaigns ?? [] }),
      )
      .catch(() => {});
  }, []);

  function toggleRating(r: string) {
    const ratings = value.ratings.includes(r)
      ? value.ratings.filter((x) => x !== r)
      : [...value.ratings, r];
    onChange({ ...value, ratings });
  }

  function toggleStatus(s: string) {
    const status = value.status.includes(s)
      ? value.status.filter((x) => x !== s)
      : [...value.status, s];
    onChange({ ...value, status });
  }

  const hasLeadLabel =
    value.hasLead === true ? 'Есть лид' : value.hasLead === false ? 'Нет лида' : 'Лид: все';

  function cycleHasLead() {
    const next = value.hasLead === null ? true : value.hasLead === true ? false : null;
    onChange({ ...value, hasLead: next });
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
      {/* Rating multi-select */}
      <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>Рейтинг:</span>
        {RATING_OPTIONS.map((r) => (
          <button
            key={r}
            type="button"
            className={value.ratings.includes(r) ? 'admin-btn admin-btn-primary' : 'admin-btn'}
            onClick={() => toggleRating(r)}
            style={{ padding: '3px 10px', fontSize: 11 }}
          >
            {r}
          </button>
        ))}
      </div>

      <UtmFilter
        label="UTM source"
        options={utmOptions.sources}
        value={value.utmSources}
        onChange={(v) => onChange({ ...value, utmSources: v })}
      />
      <UtmFilter
        label="UTM campaign"
        options={utmOptions.campaigns}
        value={value.utmCampaigns}
        onChange={(v) => onChange({ ...value, utmCampaigns: v })}
      />

      <button
        type="button"
        className={value.hasLead !== null ? 'admin-btn admin-btn-primary' : 'admin-btn'}
        onClick={cycleHasLead}
        title="Клик переключает: все / есть лид / нет лида"
      >
        {hasLeadLabel}
      </button>

      {/* Status multi-select */}
      <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>Статус:</span>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={value.status.includes(s.id) ? 'admin-btn admin-btn-primary' : 'admin-btn'}
            onClick={() => toggleStatus(s.id)}
            style={{ padding: '3px 10px', fontSize: 11 }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
