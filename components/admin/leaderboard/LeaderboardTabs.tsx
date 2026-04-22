import type { LeaderboardPeriod } from '@/lib/admin/api';
const LABEL: Record<LeaderboardPeriod, string> = { week: 'Неделя', month: 'Месяц', all: 'Всё время' };
const ORDER: LeaderboardPeriod[] = ['week', 'month', 'all'];

export function LeaderboardTabs({ value, onChange }: { value: LeaderboardPeriod; onChange: (p: LeaderboardPeriod) => void }) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--admin-bg-2)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: 2 }}>
      {ORDER.map(p => {
        const active = p === value;
        return (
          <button key={p} type="button" onClick={() => onChange(p)} style={{
            padding: '6px 12px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer',
            background: active ? 'var(--admin-bg)' : 'transparent',
            color: active ? 'var(--admin-text)' : 'var(--admin-text-muted)',
          }}>{LABEL[p]}</button>
        );
      })}
    </div>
  );
}
