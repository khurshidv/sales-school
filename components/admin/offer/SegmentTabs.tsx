'use client';

import { useEffect, useState } from 'react';
import { fetchOfferSegmentBreakdown, type OfferSegmentRow } from '@/lib/admin/api';
import type { PeriodParamState } from '@/lib/admin/usePeriodParam';

type Field = 'device_type' | 'browser';

const TABS: Array<{ id: Field; label: string }> = [
  { id: 'device_type', label: 'Устройство' },
  { id: 'browser', label: 'Браузер' },
];

export function SegmentTabs({ periodState }: { periodState: PeriodParamState }) {
  const [field, setField] = useState<Field>('device_type');
  const [rows, setRows] = useState<OfferSegmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOfferSegmentBreakdown({
      field,
      period: periodState.period,
      from: periodState.from,
      to: periodState.to,
    })
      .then(r => { if (!cancelled) { setRows(r); setLoading(false); } })
      .catch(() => { if (!cancelled) { setRows([]); setLoading(false); } });
    return () => { cancelled = true; };
  }, [field, periodState.period, periodState.from, periodState.to]);

  return (
    <div className="admin-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>
          Сегменты
        </div>
        <div style={{ display: 'inline-flex', gap: 4 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setField(t.id)}
              className={field === t.id ? 'admin-btn admin-btn-primary' : 'admin-btn'}
              style={{ padding: '4px 10px', fontSize: 11 }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
      ) : rows.length === 0 ? (
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Нет данных</div>
      ) : (
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Сегмент</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Views</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Clicks</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Заявок</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>CTR</th>
              <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>CR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.segment} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '6px 4px', fontWeight: 600 }}>{r.segment}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.views}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.clicks}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.conversions}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700 }}>{r.ctr.toFixed(1)}%</td>
                <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>{r.cr.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
