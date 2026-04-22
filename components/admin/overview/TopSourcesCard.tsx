import type { UtmFunnelRow } from '@/lib/admin/types-v2';
import { THRESHOLDS } from '@/lib/admin/thresholds';

export interface TopSourcesCardProps {
  utm: UtmFunnelRow[];
}

export function TopSourcesCard({ utm }: TopSourcesCardProps) {
  const rows = [...utm]
    .filter(r => r.visitors >= THRESHOLDS.funnel.minVisitorsForBest)
    .map(r => ({
      source: r.utm_source || 'direct',
      visitors: r.visitors,
      completed: r.completed,
      cr: r.visitors > 0 ? (r.completed / r.visitors) * 100 : 0,
    }))
    .sort((a, b) => b.cr - a.cr)
    .slice(0, 5);

  return (
    <div className="admin-card" style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>
        Топ-5 источников по CR
      </div>
      {rows.length === 0 ? (
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 12 }}>
          Нет источников с ≥{THRESHOLDS.funnel.minVisitorsForBest} визитов
        </div>
      ) : (
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ textAlign: 'left',  padding: '6px 4px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Источник</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Визиты</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>CR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.source} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                <td style={{ padding: '6px 4px', fontWeight: 600 }}>{r.source}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.visitors.toLocaleString('ru-RU')}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700 }}>{r.cr.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <a
        href="/admin/funnel"
        style={{ fontSize: 11, color: 'var(--admin-accent-violet)', marginTop: 12, display: 'inline-block' }}
      >
        Подробнее в воронке →
      </a>
    </div>
  );
}
