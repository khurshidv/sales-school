'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import PeriodFilter from '@/components/admin/PeriodFilter';
import DonutChart from '@/components/admin/charts/DonutChart';
import { fetchFunnel } from '@/lib/admin/api';
import { computeUtmRollup } from '@/lib/admin/marketing/computeUtmRollup';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import type { UtmFunnelRow } from '@/lib/admin/types-v2';

export default function FunnelClient() {
  const [periodState, setPeriod] = usePeriodParam();
  const { period, from, to } = periodState;
  const [rows, setRows] = useState<UtmFunnelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFunnel(periodState).then((res) => {
      if (cancelled) return;
      setRows(res.utm); setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      console.error('[funnel] fetch failed', err);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [period, from, to]);

  const rollup = useMemo(() => computeUtmRollup(rows), [rows]);
  const slices = rollup.rows.map((r) => ({ label: r.source, value: r.visitors }));

  return (
    <div>
      <PageHeader
        title="Funnel & UTM"
        subtitle="Воронка по источникам трафика — какие каналы дают качественных игроков."
        actions={<PeriodFilter value={periodState} onChange={setPeriod} />}
      />

      <div className="admin-kpi-row">
        <KpiCard label="Источников" value={rollup.rows.length} accent="violet" />
        <KpiCard label="Посетителей" value={rollup.totals.visitors.toLocaleString('ru-RU')} accent="pink" hint="уникальные просмотры лендингов" />
        <KpiCard label="Прошли всю игру" value={rollup.totals.completed.toLocaleString('ru-RU')} accent="green" />
        <KpiCard
          label="Лучший источник"
          value={rollup.rows[0]?.source ?? '—'}
          hint={rollup.rows[0] ? `${rollup.rows[0].completionRate.toFixed(1)}% завершаемость` : undefined}
          accent="orange"
        />
      </div>

      <div className="admin-two-col">
        <div className="admin-card" style={{ padding: 16, overflowX: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
            Источники по конверсии
          </div>
          {loading ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
          ) : rollup.rows.length === 0 ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Нет данных за период</div>
          ) : (
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Источник</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Посетителей</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Начали</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Прошли</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Заявки</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Конверсия</th>
                </tr>
              </thead>
              <tbody>
                {rollup.rows.map((r) => (
                  <tr key={r.source} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 6px', fontWeight: 600, color: 'var(--admin-text)' }}>{r.source}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'right' }}>{r.visitors}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'right' }}>{r.started}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'right' }}>{r.completed}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: r.consultations > 0 ? 'var(--admin-accent-success)' : undefined }}>{r.consultations}</td>
                    <td style={{
                      padding: '8px 6px', textAlign: 'right', fontWeight: 700,
                      color: r.completionRate >= 30 ? 'var(--admin-accent-success)' :
                             r.completionRate >= 15 ? 'var(--admin-accent-warn)' :
                             'var(--admin-accent-danger)',
                    }}>
                      {r.completionRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
            Доли источников
          </div>
          <DonutChart slices={slices} />
        </div>
      </div>
    </div>
  );
}
