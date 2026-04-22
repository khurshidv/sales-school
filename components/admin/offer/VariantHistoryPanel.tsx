'use client';

import { useEffect, useState } from 'react';
import { fetchOfferVariants, type OfferVariantRow } from '@/lib/admin/api';
import type { PeriodParamState } from '@/lib/admin/usePeriodParam';

type SortKey = 'views' | 'ctr' | 'cr';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function VariantHistoryPanel({ periodState }: { periodState: PeriodParamState }) {
  const [rows, setRows] = useState<OfferVariantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('views');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOfferVariants({
      period: periodState.period,
      from: periodState.from,
      to: periodState.to,
    })
      .then(r => { if (!cancelled) { setRows(r); setLoading(false); } })
      .catch(() => { if (!cancelled) { setRows([]); setLoading(false); } });
    return () => { cancelled = true; };
  }, [periodState.period, periodState.from, periodState.to]);

  const sorted = [...rows].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="admin-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>
          A/B варианты оффера
        </div>
        <div style={{ display: 'inline-flex', gap: 4, fontSize: 11 }}>
          <span style={{ color: 'var(--admin-text-muted)', alignSelf: 'center' }}>сортировка:</span>
          {(['views', 'ctr', 'cr'] as SortKey[]).map(k => (
            <button
              key={k}
              type="button"
              onClick={() => setSortBy(k)}
              className={sortBy === k ? 'admin-btn admin-btn-primary' : 'admin-btn'}
              style={{ padding: '3px 8px', fontSize: 11 }}
            >
              {k.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
      ) : sorted.length === 0 ? (
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Нет данных о вариантах</div>
      ) : (
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Вариант</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Views</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Clicks</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Заявок</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>CTR</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>CR</th>
              <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Период</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => (
              <tr key={r.variant_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '6px 4px', fontWeight: 600, fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>{r.variant_id}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.views}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.clicks}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.conversions}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700 }}>{r.ctr.toFixed(1)}%</td>
                <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>{r.cr.toFixed(1)}%</td>
                <td style={{ padding: '6px 4px', color: 'var(--admin-text-muted)', fontSize: 11, whiteSpace: 'nowrap' }}>
                  {fmtDate(r.first_seen)} – {fmtDate(r.last_seen)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
