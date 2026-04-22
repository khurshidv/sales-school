import type { LeaderboardSort } from '@/lib/admin/api';
const LABEL: Record<LeaderboardSort, string> = {
  total_score: 'По очкам',
  completion_time: 'По скорости',
  s_rating_count: 'По S-рейтингам',
};

export function SortSelector({ value, onChange }: { value: LeaderboardSort; onChange: (s: LeaderboardSort) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value as LeaderboardSort)} style={{
      padding: '6px 10px', fontSize: 11, fontWeight: 600,
      border: '1px solid var(--admin-border)', borderRadius: 8, background: 'var(--admin-bg-2)',
      color: 'var(--admin-text)', cursor: 'pointer',
    }}>
      {(Object.keys(LABEL) as LeaderboardSort[]).map(s => (
        <option key={s} value={s}>{LABEL[s]}</option>
      ))}
    </select>
  );
}
