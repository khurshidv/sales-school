'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import PeriodFilter from '@/components/admin/PeriodFilter';
import DonutChart from '@/components/admin/charts/DonutChart';
import { fetchFunnel, type UtmFunnelV2Row, type UtmDimension } from '@/lib/admin/api';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import { THRESHOLDS } from '@/lib/admin/thresholds';
import { DimensionSelector } from '@/components/admin/funnel/DimensionSelector';

type SortKey = 'segment' | 'visitors' | 'registered' | 'completed' | 'consultations' | 'cr';

const VALID_DIMS: UtmDimension[] = ['utm_source', 'utm_medium', 'utm_campaign'];

function toDimension(raw: string | null): UtmDimension {
  return VALID_DIMS.includes(raw as UtmDimension) ? (raw as UtmDimension) : 'utm_source';
}

type RowWithCr = UtmFunnelV2Row & { cr: number };

export default function FunnelClient() {
  const [periodState, setPeriod] = usePeriodParam();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dimension, setDimensionState] = useState<UtmDimension>(() => toDimension(searchParams.get('dim')));
  const [rows, setRows] = useState<UtmFunnelV2Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('visitors');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  function setDimension(next: UtmDimension) {
    setDimensionState(next);
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('dim', next);
    router.replace(`?${sp.toString()}`, { scroll: false });
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFunnel({ period: periodState, dimension }).then((res) => {
      if (cancelled) return;
      setRows(res.rows);
      setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      console.error('[funnel] fetch failed', err);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [periodState.period, periodState.from, periodState.to, dimension]);

  const sorted = useMemo<RowWithCr[]>(() => {
    const withCr: RowWithCr[] = rows.map(r => ({
      ...r,
      cr: r.visitors > 0 ? (r.consultations / r.visitors) * 100 : 0,
    }));
    const sign = sortDir === 'desc' ? -1 : 1;
    return [...withCr].sort((a, b) => {
      if (sortKey === 'segment') return sign * a.segment.localeCompare(b.segment);
      return sign * ((a[sortKey] as number) - (b[sortKey] as number));
    });
  }, [rows, sortKey, sortDir]);

  const totals = useMemo(() => rows.reduce(
    (acc, r) => ({
      visitors: acc.visitors + r.visitors,
      completed: acc.completed + r.completed,
    }),
    { visitors: 0, completed: 0 },
  ), [rows]);

  const best = useMemo(() => {
    const eligible = rows
      .filter(r => r.visitors >= THRESHOLDS.funnel.minVisitorsForBest)
      .map(r => ({ segment: r.segment, cr: r.visitors > 0 ? (r.consultations / r.visitors) * 100 : 0 }))
      .sort((a, b) => b.cr - a.cr);
    return eligible[0] ?? null;
  }, [rows]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const slices = sorted.map(r => ({ label: r.segment, value: r.visitors }));

  return (
    <div>
      <PageHeader
        title="Воронка и источники"
        subtitle="Воронка по рекламным измерениям — какие каналы дают качественных игроков."
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <DimensionSelector value={dimension} onChange={setDimension} />
            <PeriodFilter value={periodState} onChange={setPeriod} />
          </div>
        }
      />

      <div className="admin-kpi-row">
        <KpiCard label="Сегментов" value={rows.length} accent="violet" />
        <KpiCard label="Посетителей" value={totals.visitors.toLocaleString('ru-RU')} accent="pink" hint="уникальные визиты" />
        <KpiCard label="Прошли игру" value={totals.completed.toLocaleString('ru-RU')} accent="green" />
        <KpiCard
          label="Лучший сегмент"
          value={best?.segment ?? '—'}
          hint={best ? `${best.cr.toFixed(1)}% CR (визит→заявка)` : `нужно ≥${THRESHOLDS.funnel.minVisitorsForBest} визитов`}
          accent="orange"
        />
      </div>

      <div className="admin-two-col admin-two-col--equal">
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
            Сегменты (сортируется по клику)
          </div>
          {loading ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
          ) : sorted.length === 0 ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Нет данных за период</div>
          ) : (
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  {(
                    [
                      ['segment',       'Сегмент',      'left'],
                      ['visitors',      'Визиты',       'right'],
                      ['registered',    'Регистрации',  'right'],
                      ['completed',     'Прошли',       'right'],
                      ['consultations', 'Заявки',       'right'],
                      ['cr',            'CR',           'right'],
                    ] as Array<[SortKey, string, 'left' | 'right']>
                  ).map(([k, label, align]) => (
                    <th
                      key={k}
                      onClick={() => toggleSort(k)}
                      style={{
                        textAlign: align, padding: '8px 6px',
                        color: 'var(--admin-text-muted)', fontWeight: 600, cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      {label}{sortKey === k ? (sortDir === 'desc' ? ' ▼' : ' ▲') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(r => (
                  <tr key={r.segment} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '6px 6px', fontWeight: 600 }}>{r.segment}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right' }}>{r.visitors.toLocaleString('ru-RU')}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right' }}>{r.registered.toLocaleString('ru-RU')}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right' }}>{r.completed.toLocaleString('ru-RU')}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right' }}>{r.consultations.toLocaleString('ru-RU')}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 700 }}>{r.cr.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
            Доли сегментов (визиты)
          </div>
          <DonutChart slices={slices} />
        </div>
      </div>
    </div>
  );
}
