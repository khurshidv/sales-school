'use client';
import { useMemo } from 'react';
import type { RatingCorrelationCell } from '@/lib/admin/api';

const DAYS = ['car-day1', 'car-day2', 'car-day3'];
const DAY_LABEL: Record<string, string> = {
  'car-day1': 'День 1', 'car-day2': 'День 2', 'car-day3': 'День 3',
};
const RATINGS = ['S', 'A', 'B', 'C', 'F'] as const;
const RATING_COLOR: Record<string, string> = {
  S: '#10b981',  // success
  A: '#22c55e',
  B: '#f59e0b',
  C: '#fb923c',
  F: '#ef4444',
};

export interface RatingCorrelationChartProps {
  cells: RatingCorrelationCell[];
}

export function RatingCorrelationChart({ cells }: RatingCorrelationChartProps) {
  const grid = useMemo(() => {
    const m = new Map<string, RatingCorrelationCell>();
    for (const c of cells) m.set(`${c.day_id}::${c.rating}`, c);
    return m;
  }, [cells]);

  const max = Math.max(1, ...cells.map(c => c.count));

  if (cells.length === 0) {
    return <div style={{ padding: 20, color: 'var(--admin-text-dim)', fontSize: 13 }}>Нет завершённых дней за период</div>;
  }

  return (
    <div>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ padding: 6, textAlign: 'left', color: 'var(--admin-text-muted)' }}>День / Рейтинг</th>
            {RATINGS.map(r => (
              <th key={r} style={{ padding: 6, textAlign: 'center', color: RATING_COLOR[r], fontWeight: 800 }}>{r}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map(day => (
            <tr key={day}>
              <td style={{ padding: 6, fontWeight: 600, color: 'var(--admin-text)' }}>{DAY_LABEL[day]}</td>
              {RATINGS.map(r => {
                const cell = grid.get(`${day}::${r}`);
                const count = cell?.count ?? 0;
                const intensity = count / max;  // 0..1
                const bg = count === 0
                  ? 'transparent'
                  : `${RATING_COLOR[r]}${Math.max(20, Math.round(intensity * 80)).toString(16).padStart(2, '0')}`;
                const title = cell
                  ? `${r} в ${DAY_LABEL[day]}: ${count} игроков, среднее время ${cell.avg_time_seconds.toFixed(0)}с`
                  : `Нет данных`;
                return (
                  <td
                    key={r}
                    title={title}
                    style={{
                      padding: 0, height: 44, textAlign: 'center',
                      border: '1px solid var(--admin-border)',
                      background: bg,
                      color: count > 0 ? 'var(--admin-text)' : 'var(--admin-text-dim)',
                      fontWeight: 700,
                      cursor: count > 0 ? 'default' : 'default',
                    }}
                  >
                    {count}
                    {count > 0 && (
                      <div style={{ fontSize: 9, fontWeight: 400, color: 'var(--admin-text-muted)' }}>
                        {cell!.avg_time_seconds.toFixed(0)}с
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 10, color: 'var(--admin-text-muted)', marginTop: 8 }}>
        Наведите на ячейку — количество игроков и среднее время на день. Интенсивность цвета = относительное количество.
      </div>
    </div>
  );
}
