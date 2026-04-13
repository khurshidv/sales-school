'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const PRESETS = [
  { label: '7 дней', days: 7 },
  { label: '30 дней', days: 30 },
  { label: '90 дней', days: 90 },
];

export default function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFrom = searchParams.get('from');
  const currentTo = searchParams.get('to');

  function setRange(days: number) {
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams(searchParams.toString());
    params.set('from', from.toISOString().split('T')[0]);
    params.set('to', to.toISOString().split('T')[0]);
    router.push(`${pathname}?${params.toString()}`);
  }

  function getActiveDays(): number | null {
    if (!currentFrom || !currentTo) return 30; // default
    const diff = (new Date(currentTo).getTime() - new Date(currentFrom).getTime()) / (24 * 60 * 60 * 1000);
    return PRESETS.find((p) => Math.abs(p.days - diff) < 2)?.days ?? null;
  }

  const activeDays = getActiveDays();

  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
      {PRESETS.map((preset) => {
        const isActive = activeDays === preset.days;
        return (
          <button
            key={preset.days}
            onClick={() => setRange(preset.days)}
            style={{
              padding: '6px 14px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: isActive ? '#111827' : '#f3f4f6',
              color: isActive ? '#fff' : '#6b7280',
              transition: 'all 0.15s',
            }}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
