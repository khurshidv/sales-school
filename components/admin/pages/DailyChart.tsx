import type { DailyViews } from '@/lib/admin/types';

export function DailyChart({ data }: { data: DailyViews[] }) {
  if (data.length === 0) {
    return <p style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Нет данных</p>;
  }

  const max = Math.max(...data.map((d) => d.views), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
      {data.map((d) => {
        const height = Math.max((d.views / max) * 100, 3);
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.views} просмотров, ${d.unique_visitors} уникальных`}
            style={{
              flex: 1,
              minWidth: 8,
              maxWidth: 24,
              height: `${height}%`,
              background: 'var(--admin-accent-violet, #6366f1)',
              borderRadius: '4px 4px 0 0',
              cursor: 'default',
            }}
          />
        );
      })}
    </div>
  );
}
