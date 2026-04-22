'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import ScenarioSelector from '@/components/admin/ScenarioSelector';
import DayTabs from '@/components/admin/DayTabs';
import PeriodFilter from '@/components/admin/PeriodFilter';
import InsightCard from '@/components/admin/InsightCard';
import KpiCard from '@/components/admin/KpiCard';
import ScenarioFlowMap from '@/components/admin/charts/ScenarioFlowMap';
import { fetchBranch } from '@/lib/admin/api';
import { day1, day2, day3 } from '@/game/data/scenarios/car-dealership';
import type { Day } from '@/game/engine/types';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import type { BranchFlowRow, NodeStat, DropoffRow } from '@/lib/admin/types-v2';
import { SCENARIOS, DAYS } from '@/lib/admin/types-v2';
import { THRESHOLDS } from '@/lib/admin/thresholds';

const DAY_REGISTRY: Record<string, Day> = {
  'car-day1': day1,
  'car-day2': day2,
  'car-day3': day3,
};

export default function BranchClient() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [dayId, setDayId] = useState<string>(DAYS[0].id);
  const [period, setPeriod] = usePeriodParam();

  const [flows, setFlows] = useState<BranchFlowRow[]>([]);
  const [stats, setStats] = useState<NodeStat[]>([]);
  const [dropoffs, setDropoffs] = useState<DropoffRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBranch({ scenarioId, dayId, period }).then((res) => {
      if (cancelled) return;
      setFlows(res.flows); setStats(res.stats); setDropoffs(res.dropoffs); setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      console.error('[branch] fetch failed', err);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [scenarioId, dayId, period]);

  const day = DAY_REGISTRY[dayId];
  const totalFlows = flows.reduce((acc, f) => acc + f.flow_count, 0);
  const totalNodes = useMemo(() => day ? Object.keys(day.nodes).length : 0, [day]);
  const visitedNodes = useMemo(() => {
    if (!day) return 0;
    const visited = new Set(stats.filter((s) => s.entered_count > 0).map((s) => s.node_id));
    return [...visited].filter((id) => id in day.nodes).length;
  }, [day, stats]);
  const topNode = stats[0];
  const slowNode = [...stats].sort((a, b) => b.avg_thinking_time_ms - a.avg_thinking_time_ms)[0];

  return (
    <div>
      <PageHeader
        title="Карта сценария"
        subtitle="Полный граф узлов и ветвлений. Цифры — сколько игроков прошли и какой % выбрал каждый путь."
        actions={
          <>
            <ScenarioSelector value={scenarioId} onChange={setScenarioId} />
            <PeriodFilter value={period} onChange={setPeriod} />
          </>
        }
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <DayTabs value={dayId} onChange={setDayId} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Всего переходов" value={totalFlows.toLocaleString('ru-RU')} accent="violet" />
        <KpiCard label="Узлов в сценарии" value={totalNodes} accent="pink" />
        <KpiCard label="Посещено игроками" value={`${visitedNodes} / ${totalNodes}`} accent="violet" />
        <KpiCard label="Drop-off узлов" value={dropoffs.length} accent="orange" />
      </div>

      {slowNode && slowNode.avg_thinking_time_ms > THRESHOLDS.engagement.slowNodeMs && (
        <div style={{ marginBottom: 16 }}>
          <InsightCard
            tone="warning"
            title="Медленный узел"
            body={
              <>
                Узел <code>{slowNode.node_id}</code> — игроки задумываются{' '}
                {(slowNode.avg_thinking_time_ms / 1000).toFixed(1)}с в среднем. Возможно, формулировка непонятна.
              </>
            }
          />
        </div>
      )}

      <div className="admin-card" style={{ padding: 16 }}>
        {!day ? (
          <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>
            Сценарий не найден.
          </div>
        ) : loading ? (
          <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>
            Загружаем данные…
          </div>
        ) : (
          <ScenarioFlowMap key={day.id} day={day} flows={flows} stats={stats} dropoffs={dropoffs} />
        )}
      </div>

      {topNode && (
        <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginTop: 12 }}>
          Топ узел по посещаемости: <strong>{topNode.node_id}</strong> ({topNode.entered_count} визитов)
        </div>
      )}
    </div>
  );
}
