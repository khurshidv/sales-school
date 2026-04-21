'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import ScenarioSelector from '@/components/admin/ScenarioSelector';
import PeriodFilter from '@/components/admin/PeriodFilter';
import KpiCard from '@/components/admin/KpiCard';
import InsightCard from '@/components/admin/InsightCard';
import DropoffBars from '@/components/admin/charts/DropoffBars';
import { fetchDropoff } from '@/lib/admin/api';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import type { DropoffRow } from '@/lib/admin/types-v2';
import { SCENARIOS } from '@/lib/admin/types-v2';

export default function DropoffClient() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [period, setPeriod] = usePeriodParam();
  const [rows, setRows] = useState<DropoffRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDropoff({ scenarioId, period }).then((res) => {
      if (cancelled) return;
      setRows(res.dropoffs); setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      console.error('[dropoff] fetch failed', err);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [scenarioId, period]);

  const total = rows.reduce((acc, r) => acc + r.dropoff_count, 0);
  const top = rows[0];

  const byDay = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.day_id] = (acc[r.day_id] ?? 0) + r.dropoff_count;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Drop-off Zones"
        subtitle="Где конкретно игроки закрывают вкладку, не закончив день."
        actions={
          <>
            <ScenarioSelector value={scenarioId} onChange={setScenarioId} />
            <PeriodFilter value={period} onChange={setPeriod} />
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Всего drop-off" value={total} accent="orange" />
        <KpiCard label="Уникальных узлов" value={rows.length} accent="pink" />
        <KpiCard
          label="Топ узел"
          value={top ? top.node_id : '—'}
          hint={top ? `${top.dropoff_count} выпадений` : undefined}
          accent="violet"
        />
        <KpiCard
          label="Дней с проблемами"
          value={Object.keys(byDay).length}
          hint={Object.entries(byDay).map(([d, c]) => `${d}: ${c}`).join(' · ') || undefined}
          accent="blue"
        />
      </div>

      {top && top.dropoff_count >= 5 && (
        <div style={{ marginBottom: 16 }}>
          <InsightCard
            tone="danger"
            title="Критический drop-off"
            body={
              <>
                Узел <code>{top.node_id}</code> в дне <code>{top.day_id}</code> — {top.dropoff_count} игроков
                ушли отсюда. Стоит пересмотреть формулировку или добавить подсказку.
              </>
            }
          />
        </div>
      )}

      <div className="admin-card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
          Топ-50 узлов по drop-off
        </div>
        {loading ? (
          <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '24px 20px', color: 'var(--admin-text-dim)', fontSize: 13, textAlign: 'center' }}>
            <div style={{ fontSize: 24, opacity: 0.6, marginBottom: 6 }}>✅</div>
            <strong>Пока никто не выпал из сценария.</strong>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Либо никто ещё не играл за выбранный период, либо все игроки проходят до конца.
            </div>
          </div>
        ) : (
          <DropoffBars rows={rows} />
        )}
      </div>
    </div>
  );
}
