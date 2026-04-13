'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useRef, useState } from 'react';

const btnBase: React.CSSProperties = {
  padding: '7px 14px',
  fontSize: 12,
  fontWeight: 600,
  border: 'none',
  borderRadius: 99,
  cursor: 'pointer',
  transition: 'all 0.15s',
};

const inputStyle: React.CSSProperties = {
  padding: '7px 10px',
  fontSize: 13,
  border: '1px solid #d1d5db',
  borderRadius: 8,
  outline: 'none',
  color: '#374151',
  background: '#fff',
};

function FiltersInner({
  showSearch,
  searchPlaceholder,
  showDateRange,
}: {
  showSearch?: boolean;
  searchPlaceholder?: string;
  showDateRange?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentFrom = searchParams.get('from') ?? '';
  const currentTo = searchParams.get('to') ?? '';

  const [fromVal, setFromVal] = useState(currentFrom);
  const [toVal, setToVal] = useState(currentTo);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('p'); // reset pagination
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const val = searchInputRef.current?.value?.trim();
    updateParams({ q: val || null });
  }

  // Quick presets
  const DATE_PRESETS = [
    { label: 'Сегодня', days: 0 },
    { label: '7 дн', days: 7 },
    { label: '30 дн', days: 30 },
    { label: '90 дн', days: 90 },
    { label: 'Всё', days: -1 },
  ];

  function setPreset(days: number) {
    if (days === -1) {
      setFromVal('');
      setToVal('');
      updateParams({ from: null, to: null });
    } else {
      const to = new Date();
      const from = days === 0
        ? new Date(to.getFullYear(), to.getMonth(), to.getDate())
        : new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
      const fromStr = toLocalDatetime(from);
      const toStr = toLocalDatetime(to);
      setFromVal(fromStr);
      setToVal(toStr);
      updateParams({ from: fromStr, to: toStr });
    }
  }

  function applyCustomRange() {
    updateParams({
      from: fromVal || null,
      to: toVal || null,
    });
  }

  function clearDates() {
    setFromVal('');
    setToVal('');
    updateParams({ from: null, to: null });
  }

  // Check which preset is active
  function getActivePreset(): number | null {
    if (!currentFrom && !currentTo) return -1;
    if (!currentFrom) return null;
    const fromDate = new Date(currentFrom);
    const diffMs = Date.now() - fromDate.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
    // Only match if no time component in from (just a date preset)
    if (diffDays <= 1 && !currentFrom.includes('T')) return 0;
    const match = DATE_PRESETS.find((p) => p.days > 0 && Math.abs(p.days - diffDays) < 2);
    return match?.days ?? null;
  }

  const activePreset = getActivePreset();
  const hasDateFilter = Boolean(currentFrom || currentTo);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
      {/* Row 1: Search */}
      {showSearch && (
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6 }}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder={searchPlaceholder ?? 'Поиск...'}
            defaultValue={searchParams.get('q') ?? ''}
            style={{ ...inputStyle, width: 260 }}
          />
          <button type="submit" style={{ ...btnBase, background: '#111827', color: '#fff', borderRadius: 8 }}>
            Найти
          </button>
          {searchParams.get('q') && (
            <button
              type="button"
              onClick={() => {
                if (searchInputRef.current) searchInputRef.current.value = '';
                updateParams({ q: null });
              }}
              style={{ ...btnBase, background: '#f3f4f6', color: '#6b7280', borderRadius: 8 }}
            >
              ✕
            </button>
          )}
        </form>
      )}

      {/* Row 2: Date range */}
      {showDateRange && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {/* Presets */}
          <div style={{ display: 'flex', gap: 4 }}>
            {DATE_PRESETS.map((p) => {
              const isActive = activePreset === p.days;
              return (
                <button
                  key={p.days}
                  onClick={() => setPreset(p.days)}
                  style={{
                    ...btnBase,
                    padding: '6px 12px',
                    background: isActive ? '#111827' : '#f3f4f6',
                    color: isActive ? '#fff' : '#6b7280',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Separator */}
          <span style={{ color: '#d1d5db', fontSize: 14 }}>|</span>

          {/* Custom datetime inputs */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>с</span>
            <input
              type="datetime-local"
              value={fromVal}
              onChange={(e) => setFromVal(e.target.value)}
              style={{ ...inputStyle, width: 185 }}
            />
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>до</span>
            <input
              type="datetime-local"
              value={toVal}
              onChange={(e) => setToVal(e.target.value)}
              style={{ ...inputStyle, width: 185 }}
            />
            <button
              type="button"
              onClick={applyCustomRange}
              style={{ ...btnBase, background: '#6366f1', color: '#fff', borderRadius: 8 }}
            >
              Применить
            </button>
            {hasDateFilter && (
              <button
                type="button"
                onClick={clearDates}
                style={{ ...btnBase, background: '#f3f4f6', color: '#6b7280', borderRadius: 8 }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Format Date to `YYYY-MM-DDTHH:mm` for datetime-local input */
function toLocalDatetime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TableFilters(props: {
  showSearch?: boolean;
  searchPlaceholder?: string;
  showDateRange?: boolean;
}) {
  return (
    <Suspense>
      <FiltersInner {...props} />
    </Suspense>
  );
}
