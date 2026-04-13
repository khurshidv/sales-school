'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useRef } from 'react';

const btnBase: React.CSSProperties = {
  padding: '7px 14px',
  fontSize: 12,
  fontWeight: 600,
  border: 'none',
  borderRadius: 99,
  cursor: 'pointer',
  transition: 'all 0.15s',
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
  const inputRef = useRef<HTMLInputElement>(null);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    // reset to page 1 on filter change
    params.delete('page');
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const val = inputRef.current?.value?.trim();
    updateParams({ q: val || null });
  }

  // Date range presets
  const DATE_PRESETS = [
    { label: 'Сегодня', days: 0 },
    { label: '7 дней', days: 7 },
    { label: '30 дней', days: 30 },
    { label: '90 дней', days: 90 },
    { label: 'Всё время', days: -1 },
  ];

  function getActiveDays(): number {
    const from = searchParams.get('from');
    if (!from) return -1; // all time default
    const diff = Math.round(
      (Date.now() - new Date(from).getTime()) / (24 * 60 * 60 * 1000),
    );
    if (diff <= 1) return 0;
    const match = DATE_PRESETS.find((p) => p.days >= 0 && Math.abs(p.days - diff) < 2);
    return match?.days ?? -2; // -2 = custom
  }

  function setDateRange(days: number) {
    if (days === -1) {
      updateParams({ from: null, to: null });
    } else {
      const to = new Date();
      const from = days === 0
        ? new Date(to.getFullYear(), to.getMonth(), to.getDate())
        : new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
      updateParams({
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      });
    }
  }

  const activeDays = getActiveDays();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center' }}>
      {showSearch && (
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder={searchPlaceholder ?? 'Поиск...'}
            defaultValue={searchParams.get('q') ?? ''}
            style={{
              padding: '7px 12px',
              fontSize: 13,
              border: '1px solid #d1d5db',
              borderRadius: 8,
              width: 220,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              ...btnBase,
              background: '#111827',
              color: '#fff',
              borderRadius: 8,
            }}
          >
            Найти
          </button>
          {searchParams.get('q') && (
            <button
              type="button"
              onClick={() => {
                if (inputRef.current) inputRef.current.value = '';
                updateParams({ q: null });
              }}
              style={{
                ...btnBase,
                background: '#f3f4f6',
                color: '#6b7280',
                borderRadius: 8,
              }}
            >
              Сбросить
            </button>
          )}
        </form>
      )}
      {showDateRange && (
        <div style={{ display: 'flex', gap: 4 }}>
          {DATE_PRESETS.map((p) => {
            const isActive = activeDays === p.days;
            return (
              <button
                key={p.days}
                onClick={() => setDateRange(p.days)}
                style={{
                  ...btnBase,
                  background: isActive ? '#111827' : '#f3f4f6',
                  color: isActive ? '#fff' : '#6b7280',
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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
