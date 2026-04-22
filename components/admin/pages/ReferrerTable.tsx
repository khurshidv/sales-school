import type { ReferrerBreakdown } from '@/lib/admin/types';

export function ReferrerTable({ data }: { data: ReferrerBreakdown[] }) {
  if (data.length === 0) {
    return <p style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Нет данных по рефереру</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--admin-border, #f3f4f6)' }}>
            <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Реферер</th>
            <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Визиты</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--admin-border, #f9fafb)' }}>
              <td style={{ padding: '8px 12px', fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--admin-text)' }}>
                {row.referrer}
              </td>
              <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--admin-text)' }}>
                {row.count.toLocaleString('ru-RU')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
