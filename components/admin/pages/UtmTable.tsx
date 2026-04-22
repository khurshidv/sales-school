import type { UTMBreakdown } from '@/lib/admin/types';

export function UtmTable({ data }: { data: UTMBreakdown[] }) {
  if (data.length === 0) {
    return <p style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Нет данных по UTM</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--admin-border, #f3f4f6)' }}>
            {['Источник', 'Канал', 'Кампания', 'Просмотры', 'Уникальные'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--admin-border, #f9fafb)' }}>
              <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--admin-text)' }}>{row.source}</td>
              <td style={{ padding: '8px 12px', color: 'var(--admin-text-muted)' }}>{row.medium}</td>
              <td style={{ padding: '8px 12px', color: 'var(--admin-text-muted)' }}>{row.campaign}</td>
              <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--admin-text)' }}>{row.views.toLocaleString('ru-RU')}</td>
              <td style={{ padding: '8px 12px', color: 'var(--admin-text)' }}>{row.unique_visitors.toLocaleString('ru-RU')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
