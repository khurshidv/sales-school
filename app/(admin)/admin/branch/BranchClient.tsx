'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import ScenarioSelector from '@/components/admin/ScenarioSelector';
import DayTabs from '@/components/admin/DayTabs';
import PeriodFilter from '@/components/admin/PeriodFilter';
import InsightCard from '@/components/admin/InsightCard';
import KpiCard from '@/components/admin/KpiCard';
import ScenarioFlowMap from '@/components/admin/charts/ScenarioFlowMap';
import { DesktopOnlyOverlay } from '@/components/admin/shared/DesktopOnlyOverlay';
import { fetchBranch, fetchNodeLabels } from '@/lib/admin/api';
import type { NodeLabelResult } from '@/lib/admin/api';
import { NodeDrilldownModal } from '@/components/admin/branch/NodeDrilldownModal';
import { day1, day2, day3 } from '@/game/data/scenarios/car-dealership';
import type { Day } from '@/game/engine/types';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import type { BranchFlowRow, NodeStat, DropoffRow } from '@/lib/admin/types-v2';
import type { BranchCoverage } from '@/lib/admin/api';
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
  const [periodState, setPeriod] = usePeriodParam();
  const { period, from, to } = periodState;

  const [flows, setFlows] = useState<BranchFlowRow[]>([]);
  const [stats, setStats] = useState<NodeStat[]>([]);
  const [dropoffs, setDropoffs] = useState<DropoffRow[]>([]);
  const [coverage, setCoverage] = useState<BranchCoverage>({ visited: 0, total: 0, rate: 0 });
  const [heatmapMode, setHeatmapMode] = useState<'none' | 'traffic' | 'dropoff'>('traffic');
  const [loading, setLoading] = useState(true);
  const [nodeLabels, setNodeLabels] = useState<Record<string, NodeLabelResult>>({});
  const [drillNode, setDrillNode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBranch({ scenarioId, dayId, period: periodState }).then((res) => {
      if (cancelled) return;
      setFlows(res.flows); setStats(res.stats); setDropoffs(res.dropoffs); setCoverage(res.coverage); setLoading(false);
      if (res.stats.length > 0) {
        fetchNodeLabels(scenarioId, res.stats.map(s => s.node_id))
          .then(labels => { if (!cancelled) setNodeLabels(labels); })
          .catch(() => {});
      }
    }).catch((err) => {
      if (cancelled) return;
      console.error('[branch] fetch failed', err);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [scenarioId, dayId, period, from, to]);

  const day = DAY_REGISTRY[dayId];
  const totalFlows = flows.reduce((acc, f) => acc + f.flow_count, 0);
  // totalNodes fallback: used before first fetch completes (coverage.total is 0)
  const totalNodes = day ? Object.keys(day.nodes).length : 0;
  const slowNode = [...stats].sort((a, b) => b.avg_thinking_time_ms - a.avg_thinking_time_ms)[0];

  return (
    <div>
      <PageHeader
        title="Карта сценария"
        subtitle="Полный граф узлов и ветвлений. Цифры — сколько игроков прошли и какой % выбрал каждый путь."
        actions={
          <>
            <ScenarioSelector value={scenarioId} onChange={setScenarioId} />
            <PeriodFilter value={periodState} onChange={setPeriod} />
          </>
        }
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <DayTabs value={dayId} onChange={setDayId} />
      </div>

      <div className="admin-kpi-row">
        <KpiCard label="Всего переходов" value={totalFlows.toLocaleString('ru-RU')} accent="violet" />
        <KpiCard label="Узлов в сценарии" value={coverage.total || totalNodes} accent="pink" />
        <KpiCard label="Посещено игроками" value={`${coverage.visited} / ${coverage.total || totalNodes}`} accent="violet" />
        <KpiCard label="Drop-off узлов" value={dropoffs.length} accent="orange" />
        <KpiCard
          label="Покрытие сценария"
          value={`${(coverage.rate * 100).toFixed(0)}%`}
          hint={`${coverage.visited} из ${coverage.total} узлов`}
          accent={coverage.rate >= 0.6 ? 'green' : coverage.rate >= 0.3 ? 'orange' : 'pink'}
        />
      </div>

      {slowNode && slowNode.avg_thinking_time_ms > THRESHOLDS.engagement.slowNodeMs && (
        <div style={{ marginBottom: 16 }}>
          <InsightCard
            tone="warning"
            title="Медленный узел"
            body={
              <>
                Узел <code>{nodeLabels[slowNode.node_id]?.title ?? slowNode.node_id}</code> — игроки задумываются{' '}
                {(slowNode.avg_thinking_time_ms / 1000).toFixed(1)}с в среднем. Возможно, формулировка непонятна.
              </>
            }
          />
        </div>
      )}

      <div className="admin-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'inline-flex', background: 'var(--admin-bg-2)', border: '1px solid var(--admin-border)', borderRadius: 8, padding: 2 }}>
            {(['none', 'traffic', 'dropoff'] as const).map(m => {
              const active = m === heatmapMode;
              return (
                <button key={m} type="button" onClick={() => setHeatmapMode(m)} style={{
                  padding: '4px 10px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer',
                  background: active ? 'var(--admin-bg)' : 'transparent',
                  color: active ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                }}>
                  {m === 'none' ? 'Без heatmap' : m === 'traffic' ? 'Трафик' : 'Drop-off'}
                </button>
              );
            })}
          </div>
        </div>

        {!day ? (
          <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>
            Сценарий не найден.
          </div>
        ) : loading ? (
          <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>
            Загружаем данные…
          </div>
        ) : (
          <DesktopOnlyOverlay>
            <ScenarioFlowMap key={day.id} day={day} flows={flows} stats={stats} dropoffs={dropoffs} heatmapMode={heatmapMode} onNodeClick={setDrillNode} />
          </DesktopOnlyOverlay>
        )}
      </div>
      <NodeDrilldownModal
        open={!!drillNode}
        nodeId={drillNode}
        scenarioId={scenarioId}
        dayId={dayId}
        stats={stats}
        dropoffs={dropoffs}
        nodeTitle={drillNode ? nodeLabels[drillNode]?.title : undefined}
        nodeType={drillNode ? nodeLabels[drillNode]?.type : undefined}
        nodePreview={drillNode ? nodeLabels[drillNode]?.preview : undefined}
        onClose={() => setDrillNode(null)}
      />
    </div>
  );
}
