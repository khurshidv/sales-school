'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import PeriodFilter from '@/components/admin/PeriodFilter';
import { StackedBars } from '@/components/admin/funnel/StackedBars';
import {
  fetchFunnel,
  fetchRevenue,
  type UtmFunnelV2Row,
  type UtmDimension,
  type UtmSpendRollupRow,
  type RevenueData,
} from '@/lib/admin/api';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import { THRESHOLDS } from '@/lib/admin/thresholds';
import { DimensionSelector } from '@/components/admin/funnel/DimensionSelector';
import { SpendDialog } from '@/components/admin/funnel/SpendDialog';

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
  const [spend, setSpend] = useState<UtmSpendRollupRow[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('visitors');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [spendDialogOpen, setSpendDialogOpen] = useState(false);

  function setDimension(next: UtmDimension) {
    setDimensionState(next);
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('dim', next);
    router.replace(`?${sp.toString()}`, { scroll: false });
  }

  async function loadFunnel() {
    setLoading(true);
    try {
      const [funnelRes, revenueRes] = await Promise.all([
        fetchFunnel({ period: periodState, dimension }),
        fetchRevenue({
          period: periodState.period,
          from: periodState.period === 'custom' ? periodState.from : undefined,
          to: periodState.period === 'custom' ? periodState.to : undefined,
        }).catch(() => null),
      ]);
      setRows(funnelRes.rows);
      setSpend(funnelRes.spend ?? []);
      setRevenue(revenueRes);
    } catch (err) {
      console.error('[funnel] fetch failed', err);
    }
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await loadFunnel();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const totalSpend = useMemo(() => spend.reduce((acc, s) => acc + s.total_kzt, 0), [spend]);

  const leads = useMemo(() => rows.reduce((acc, r) => acc + r.consultations, 0), [rows]);

  const cpl: number | null = leads > 0 ? totalSpend / leads : null;

  const roas: number | null = totalSpend > 0 && revenue && revenue.total > 0
    ? revenue.total / totalSpend
    : null;

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const directRow = rows.find(r => r.segment === 'direct');

  return (
    <div>
      <PageHeader
        title="Воронка и источники"
        subtitle="Воронка по рекламным измерениям — какие каналы дают качественных игроков."
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className="admin-btn"
              onClick={() => setSpendDialogOpen(true)}
            >
              Ввести расходы
            </button>
            <DimensionSelector value={dimension} onChange={setDimension} />
            <PeriodFilter value={periodState} onChange={setPeriod} />
          </div>
        }
      />

      <SpendDialog
        open={spendDialogOpen}
        onClose={() => setSpendDialogOpen(false)}
        onChange={() => void loadFunnel()}
      />

      <div className="admin-kpi-row">
        <KpiCard
          label="Без UTM"
          value={(directRow?.visitors ?? 0).toLocaleString('ru-RU')}
          accent="violet"
          hint={`${rows.length} сегментов всего`}
        />
        <KpiCard label="Посетителей" value={totals.visitors.toLocaleString('ru-RU')} accent="pink" hint="уникальные визиты" />
        <KpiCard label="Прошли игру" value={totals.completed.toLocaleString('ru-RU')} accent="green" />
        <KpiCard
          label="Лучший сегмент"
          value={best?.segment ?? '—'}
          hint={best ? `${best.cr.toFixed(1)}% CR (визит→заявка)` : `нужно ≥${THRESHOLDS.funnel.minVisitorsForBest} визитов`}
          accent="orange"
        />
        <KpiCard
          label="Расход"
          value={`${totalSpend.toLocaleString('ru-RU')} ₸`}
          accent="blue"
          hint={spend.length > 0 ? `${spend.length} источников` : 'нет данных'}
        />
        <KpiCard
          label="CPL"
          value={cpl !== null ? `${cpl.toFixed(0)} ₸` : '—'}
          accent="orange"
          hint="расход / заявки"
        />
        <KpiCard
          label="ROAS"
          value={roas !== null ? `${roas.toFixed(2)}x` : '—'}
          accent="green"
          hint={revenue && revenue.total > 0 ? `выручка ${revenue.total.toLocaleString('ru-RU')} ₸` : 'нет выручки'}
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
                    <td
                      style={{ padding: '6px 6px', fontWeight: 600 }}
                      title={r.segment === 'direct' ? 'direct = визиты без UTM-меток' : undefined}
                    >
                      {r.segment}
                      {r.segment === 'direct' && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--admin-text-muted)', fontWeight: 400 }}>
                          (без UTM)
                        </span>
                      )}
                    </td>
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
            Конверсии по сегментам
          </div>
          <StackedBars rows={rows} />
        </div>
      </div>
    </div>
  );
}
