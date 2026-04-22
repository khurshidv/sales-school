'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import ScenarioSelector from '@/components/admin/ScenarioSelector';
import PeriodFilter from '@/components/admin/PeriodFilter';
import KpiCard from '@/components/admin/KpiCard';
import InsightCard from '@/components/admin/InsightCard';
import DropoffBars from '@/components/admin/charts/DropoffBars';
import { fetchDropoff, fetchNodeLabels } from '@/lib/admin/api';
import type { DropoffRateRow, NodeLabelResult } from '@/lib/admin/api';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import { SCENARIOS } from '@/lib/admin/types-v2';
import { THRESHOLDS } from '@/lib/admin/thresholds';

export default function DropoffClient() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [periodState, setPeriod] = usePeriodParam();
  const { period, from, to } = periodState;
  const [rows, setRows] = useState<DropoffRateRow[]>([]);
  const [totals, setTotals] = useState({ entered: 0, dropped: 0, rate: 0 });
  const [labels, setLabels] = useState<Record<string, NodeLabelResult>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDropoff({ scenarioId, period: periodState })
      .then(async (res) => {
        if (cancelled) return;
        setRows(res.rows);
        setTotals(res.totals);
        if (res.rows.length > 0) {
          const nodeIds = res.rows.map((r) => r.node_id);
          const fetched = await fetchNodeLabels(scenarioId, nodeIds).catch(() => ({}));
          if (!cancelled) setLabels(fetched);
        } else {
          setLabels({});
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[dropoff] fetch failed', err);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scenarioId, period, from, to]);

  const top = rows[0];
  const aboveThreshold = rows.filter(
    (r) => r.dropoff_rate >= THRESHOLDS.dropoff.insightRateMin,
  ).length;

  const avgTimeMs =
    rows.length > 0
      ? rows.reduce((acc, r) => acc + (r.avg_time_on_node_ms ?? 0), 0) / rows.length
      : null;
  const avgTimeSec = avgTimeMs !== null ? (avgTimeMs / 1000).toFixed(1) : '—';

  const topLabel = top ? (labels[top.node_id]?.title ?? top.node_id) : '—';
  const topRatePct = top ? `${(top.dropoff_rate * 100).toFixed(1)}%` : undefined;
  const overallRatePct = `${(totals.rate * 100).toFixed(1)}%`;

  return (
    <div>
      <PageHeader
        title="Drop-off Zones"
        subtitle="Где конкретно игроки закрывают вкладку, не закончив день."
        actions={
          <>
            <ScenarioSelector value={scenarioId} onChange={setScenarioId} />
            <PeriodFilter value={periodState} onChange={setPeriod} />
          </>
        }
      />

      <div className="admin-kpi-row">
        <KpiCard
          label="Общий drop-off"
          value={overallRatePct}
          accent={totals.rate >= THRESHOLDS.dropoff.insightRateMin ? 'orange' : 'blue'}
        />
        <KpiCard
          label="Узлов выше порога"
          value={aboveThreshold}
          hint={`≥ ${(THRESHOLDS.dropoff.insightRateMin * 100).toFixed(0)}% выпадений`}
          accent="pink"
        />
        <KpiCard
          label="Худший узел"
          value={topLabel}
          hint={topRatePct}
          accent="violet"
        />
        <KpiCard
          label="Среднее время до выхода"
          value={`${avgTimeSec}с`}
          accent="blue"
        />
      </div>

      {top && totals.rate >= THRESHOLDS.dropoff.insightRateMin && (
        <div style={{ marginBottom: 16 }}>
          <InsightCard
            tone="danger"
            title="Критический drop-off"
            body={
              <>
                Худший узел: <strong>{topLabel}</strong> (день {top.day_id}) —{' '}
                {(top.dropoff_rate * 100).toFixed(1)}% игроков ушли отсюда. Стоит пересмотреть
                формулировку или добавить подсказку.
              </>
            }
          />
        </div>
      )}

      <div className="admin-card" style={{ padding: 16 }}>
        <div
          style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}
        >
          Топ-50 узлов по drop-off
        </div>
        {loading ? (
          <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>
            Загружаем…
          </div>
        ) : rows.length === 0 ? (
          <div
            style={{
              padding: '24px 20px',
              color: 'var(--admin-text-dim)',
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, opacity: 0.6, marginBottom: 6 }}>✅</div>
            <strong>Пока никто не выпал из сценария.</strong>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Либо никто ещё не играл за выбранный период, либо все игроки проходят до конца.
            </div>
          </div>
        ) : (
          <DropoffBars rows={rows} labels={labels} />
        )}
      </div>
    </div>
  );
}
