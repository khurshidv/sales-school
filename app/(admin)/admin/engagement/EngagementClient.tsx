'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import InsightCard from '@/components/admin/InsightCard';
import ScenarioSelector from '@/components/admin/ScenarioSelector';
import PeriodFilter from '@/components/admin/PeriodFilter';
import DayTabs from '@/components/admin/DayTabs';
import ThinkingBarChart from '@/components/admin/charts/ThinkingBarChart';
import { fetchEngagement } from '@/lib/admin/api';
import { computeInterestIndex } from '@/lib/admin/engagement/computeIndex';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import type { EngagementBlob, NodeStat } from '@/lib/admin/types-v2';
import { SCENARIOS, DAYS } from '@/lib/admin/types-v2';

export default function EngagementClient() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [dayId, setDayId] = useState<string>(DAYS[0].id);
  const [period, setPeriod] = usePeriodParam();

  const [blob, setBlob] = useState<EngagementBlob | null>(null);
  const [stats, setStats] = useState<NodeStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchEngagement({ scenarioId, dayId, period }).then((res) => {
      if (cancelled) return;
      setBlob(res.engagement); setStats(res.stats); setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      console.error('[engagement] fetch failed', err);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [scenarioId, dayId, period]);

  const idx = useMemo(() => blob ? computeInterestIndex(blob) : null, [blob]);

  const slowNodes = useMemo(
    () => stats.filter((s) => s.avg_thinking_time_ms > 15_000).slice(0, 3),
    [stats],
  );

  return (
    <div>
      <PageHeader
        title="Engagement"
        subtitle="Насколько игра интересна — composite Interest Index и компоненты вовлечённости."
        actions={
          <>
            <ScenarioSelector value={scenarioId} onChange={setScenarioId} />
            <PeriodFilter value={period} onChange={setPeriod} />
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard
          label="Interest Index"
          value={idx ? `${idx.score.toFixed(1)}/10` : '—'}
          accent="violet"
          hint="завершаемость + обдумывание + переигровки"
        />
        <KpiCard
          label="% завершивших день"
          value={blob ? `${(blob.completion_rate * 100).toFixed(0)}%` : '—'}
          accent="green"
          hint="доля начавших, кто завершил день"
        />
        <KpiCard
          label="Среднее время выбора"
          value={blob?.avg_thinking_time_ms ? `${(blob.avg_thinking_time_ms / 1000).toFixed(1)}с` : '—'}
          accent="pink"
          hint="оптимально 5–15 секунд"
        />
        <KpiCard
          label="% переигровок"
          value={blob ? `${(blob.replay_rate * 100).toFixed(0)}%` : '—'}
          accent="orange"
          hint="10–30% — здоровая повторяемость"
        />
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>День:</span>
        <DayTabs value={dayId} onChange={setDayId} />
      </div>

      <div className="admin-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
          Среднее время на выбор по узлам ({dayId})
        </div>
        {loading ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>
            Загружаем…
          </div>
        ) : stats.length === 0 ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)', fontSize: 13 }}>
            Нет данных о выборах за период.
          </div>
        ) : (
          <ThinkingBarChart stats={stats} />
        )}
      </div>

      {slowNodes.length > 0 && (
        <InsightCard
          tone="warning"
          title={`${slowNodes.length} «медленных» узлов`}
          body={
            <>
              Игроки задумываются &gt;15с на: {slowNodes.map((n) => <code key={n.node_id} style={{ marginRight: 6 }}>{n.node_id}</code>)}
            </>
          }
        />
      )}
    </div>
  );
}
