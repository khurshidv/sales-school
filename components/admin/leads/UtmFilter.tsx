'use client';

import { useEffect, useRef, useState } from 'react';
import { Filter, X } from 'lucide-react';

export interface UtmFilterProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}

export function UtmFilter({ label, options, value, onChange, placeholder }: UtmFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  }

  const q = search.toLowerCase();
  const filtered = q ? options.filter(o => o.toLowerCase().includes(q)) : options;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className={value.length > 0 ? 'admin-btn admin-btn-primary' : 'admin-btn'}
        onClick={() => setOpen(!open)}
      >
        <Filter size={12} />
        <span>{label}{value.length > 0 ? ` (${value.length})` : ''}</span>
        {value.length > 0 && (
          <span
            role="button"
            aria-label="Очистить"
            onClick={(e) => { e.stopPropagation(); onChange([]); }}
            style={{ display: 'inline-flex', marginLeft: 4, cursor: 'pointer' }}
          >
            <X size={12} />
          </span>
        )}
      </button>
      {open && (
        <div className="admin-card" style={{
          position: 'absolute', top: 36, left: 0,
          minWidth: 220, maxHeight: 320,
          padding: 8, zIndex: 30, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <input
            type="text"
            placeholder="Поиск…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-btn"
            style={{ padding: '6px 10px', fontSize: 12 }}
          />
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 && (
              <div style={{ color: 'var(--admin-text-dim)', padding: 8, fontSize: 12 }}>
                {placeholder ?? 'Нет значений'}
              </div>
            )}
            {filtered.map(o => (
              <label key={o} style={{
                display: 'flex', gap: 8, alignItems: 'center',
                padding: '4px 6px', fontSize: 12, cursor: 'pointer',
                borderRadius: 4,
              }}>
                <input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
