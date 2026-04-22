'use client';
import { useMemo } from 'react';
import type { ReferrerBreakdown } from '@/lib/admin/types';

function extractDomain(url: string | null | undefined): string {
  if (!url) return '(direct)';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url || '(direct)';
  }
}

export function ReferrerTable({ data }: { data: ReferrerBreakdown[] }) {
  const grouped = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of data) {
      const d = extractDomain(r.referrer);
      m.set(d, (m.get(d) ?? 0) + r.count);
    }
    return Array.from(m.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  if (grouped.length === 0) {
    return <p style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Нет данных по рефереру</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--admin-border, #f3f4f6)' }}>
            <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Домен</th>
            <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Визиты</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map((r) => (
            <tr key={r.referrer} style={{ borderBottom: '1px solid var(--admin-border, #f9fafb)' }}>
              <td style={{ padding: '8px 12px', fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--admin-text)' }}>
                {r.referrer}
              </td>
              <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--admin-text)' }}>
                {r.count.toLocaleString('ru-RU')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
