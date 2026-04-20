'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import ScenarioSelector from '@/components/admin/ScenarioSelector';
import DayTabs from '@/components/admin/DayTabs';
import PeriodFilter from '@/components/admin/PeriodFilter';
import InsightCard from '@/components/admin/InsightCard';
import KpiCard from '@/components/admin/KpiCard';
import SankeyChart from '@/components/admin/charts/SankeyChart';
import BranchTree from '@/components/admin/charts/BranchTree';
import ScenarioMap from '@/components/admin/charts/ScenarioMap';
import { GitBranch, Network, TreePine } from 'lucide-react';
import { fetchBranch } from '@/lib/admin/api';
import { buildSankeyData } from '@/lib/admin/branch/buildSankeyData';
import { buildTreeData } from '@/lib/admin/branch/buildTreeData';
import { buildGraphData } from '@/lib/admin/branch/buildGraphData';
import type { BranchFlowRow, NodeStat, DropoffRow, Period } from '@/lib/admin/types-v2';
import { SCENARIOS, DAYS } from '@/lib/admin/types-v2';

type Tab = 'sankey' | 'tree' | 'map';

export default function BranchClient() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [dayId, setDayId] = useState<string>(DAYS[0].id);
  const [period, setPeriod] = useState<Period>('30d');
  const [tab, setTab] = useState<Tab>('sankey');

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

  const sankey = useMemo(() => buildSankeyData(flows), [flows]);
  const graph = useMemo(() => buildGraphData(flows, stats, dropoffs), [flows, stats, dropoffs]);

  const rootId = useMemo(() => {
    const targets = new Set(flows.map((f) => f.to_node));
    const sources = flows.map((f) => f.from_node);
    return sources.find((s) => !targets.has(s)) ?? flows[0]?.from_node ?? '';
  }, [flows]);
  const tree = useMemo(() => buildTreeData(flows, rootId), [flows, rootId]);
  const rootCount = useMemo(() => {
    return flows.filter((f) => f.from_node === rootId).reduce((acc, f) => acc + f.flow_count, 0);
  }, [flows, rootId]);

  const totalFlows = flows.reduce((acc, f) => acc + f.flow_count, 0);
  const topNode = stats[0];
  const slowNode = [...stats].sort((a, b) => b.avg_thinking_time_ms - a.avg_thinking_time_ms)[0];

  return (
    <div>
      <PageHeader
        title="Branch Analytics"
        subtitle="Как игроки проходят сценарий — главные пути, проблемные узлы, выпадения."
        actions={
          <>
            <ScenarioSelector value={scenarioId} onChange={setScenarioId} />
            <PeriodFilter value={period} onChange={setPeriod} />
          </>
        }
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <DayTabs value={dayId} onChange={setDayId} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={() => setTab('sankey')} className={tab === 'sankey' ? 'admin-btn admin-btn-primary' : 'admin-btn'}>
            <GitBranch size={14} /> Поток
          </button>
          <button onClick={() => setTab('tree')} className={tab === 'tree' ? 'admin-btn admin-btn-primary' : 'admin-btn'}>
            <TreePine size={14} /> Дерево
          </button>
          <button onClick={() => setTab('map')} className={tab === 'map' ? 'admin-btn admin-btn-primary' : 'admin-btn'}>
            <Network size={14} /> Карта
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Всего переходов" value={totalFlows.toLocaleString('ru-RU')} accent="violet" />
        <KpiCard label="Узлов задействовано" value={stats.length} accent="pink" />
        <KpiCard label="Drop-off узлов" value={dropoffs.length} accent="orange" />
      </div>

      {slowNode && slowNode.avg_thinking_time_ms > 15_000 && (
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
        {loading ? (
          <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>
            Загружаем данные…
          </div>
        ) : flows.length === 0 ? (
          <div style={{ height: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--admin-text-dim)', fontSize: 13, textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 28, opacity: 0.6 }}>🌱</div>
            <div><strong>Пока нет данных о переходах.</strong></div>
            <div style={{ fontSize: 12, maxWidth: 420 }}>
              События движения игроков между узлами появятся как только кто-то начнёт играть (нужен деплой новой аналитики).
            </div>
          </div>
        ) : tab === 'sankey' ? (
          <SankeyChart data={sankey} />
        ) : tab === 'tree' ? (
          <BranchTree nodes={tree} total={rootCount} />
        ) : (
          <ScenarioMap data={graph} />
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
