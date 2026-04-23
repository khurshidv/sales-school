'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import InsightCard from '@/components/admin/InsightCard';
import ScenarioSelector from '@/components/admin/ScenarioSelector';
import PeriodFilter from '@/components/admin/PeriodFilter';
import DayTabs from '@/components/admin/DayTabs';
import ThinkingBarChart from '@/components/admin/charts/ThinkingBarChart';
import { HeatCurveChart } from '@/components/admin/engagement/HeatCurveChart';
import { FormulaPopover } from '@/components/admin/shared/FormulaPopover';
import { fetchEngagement, fetchEngagementTrend, fetchNodeLabels, fetchRatingCorrelation, type GameLanguage } from '@/lib/admin/api';
import type { ThinkingPercentiles, RetentionSummary, EngagementTrendRow, NodeLabelResult, RatingCorrelationCell } from '@/lib/admin/api';
import { RetentionCard } from '@/components/admin/engagement/RetentionCard';
import { InterestTrendChart } from '@/components/admin/engagement/InterestTrendChart';
import { RatingCorrelationChart } from '@/components/admin/engagement/RatingCorrelationChart';
import { computeInterestIndex } from '@/lib/admin/engagement/computeIndex';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import type { EngagementBlob, NodeStat } from '@/lib/admin/types-v2';
import { SCENARIOS, DAYS } from '@/lib/admin/types-v2';
import { THRESHOLDS } from '@/lib/admin/thresholds';
import { LanguageTabs, type LanguageFilter } from '@/components/admin/shared/LanguageTabs';

export default function EngagementClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [dayId, setDayId] = useState<string>(DAYS[0].id);
  const [periodState, setPeriod] = usePeriodParam();
  const { period, from, to } = periodState;
  const [language, setLanguageState] = useState<LanguageFilter>(() => {
    const raw = searchParams.get('lang');
    return raw === 'uz' || raw === 'ru' ? raw : 'all';
  });

  function setLanguage(next: LanguageFilter) {
    setLanguageState(next);
    const sp = new URLSearchParams(searchParams.toString());
    if (next === 'all') sp.delete('lang');
    else sp.set('lang', next);
    router.replace(`?${sp.toString()}`, { scroll: false });
  }

  const [blob, setBlob] = useState<EngagementBlob | null>(null);
  const [stats, setStats] = useState<NodeStat[]>([]);
  const [labels, setLabels] = useState<Record<string, NodeLabelResult>>({});
  const [percentiles, setPercentiles] = useState<ThinkingPercentiles | null>(null);
  const [retention, setRetention] = useState<RetentionSummary | null>(null);
  const [trend, setTrend] = useState<EngagementTrendRow[]>([]);
  const [correlationCells, setCorrelationCells] = useState<RatingCorrelationCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const apiLang = language === 'all' ? null : (language as GameLanguage);
    setLoading(true);
    fetchEngagement({ scenarioId, dayId, period: periodState, language: apiLang }).then((res) => {
      if (cancelled) return;
      setBlob(res.engagement);
      setStats(res.stats);
      setPercentiles(res.percentiles ?? null);
      setRetention(res.retention ?? null);
      setLoading(false);
      if (res.stats.length > 0) {
        fetchNodeLabels(scenarioId, res.stats.map(s => s.node_id))
          .then((lbls) => { if (!cancelled) setLabels(lbls); })
          .catch((err) => console.error('[engagement] node-labels fetch failed', err));
      }
    }).catch((err) => {
      if (cancelled) return;
      console.error('[engagement] fetch failed', err);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [scenarioId, dayId, period, from, to, language]);

  useEffect(() => {
    let cancelled = false;
    const apiLang = language === 'all' ? null : (language as GameLanguage);
    fetchEngagementTrend({ scenarioId, period: periodState, language: apiLang }).then((res) => {
      if (cancelled) return;
      setTrend(res.points);
    }).catch((err) => {
      if (cancelled) return;
      console.error('[engagement] trend fetch failed', err);
    });
    return () => { cancelled = true; };
  }, [scenarioId, period, from, to, language]);

  useEffect(() => {
    let cancelled = false;
    fetchRatingCorrelation({ scenarioId, period: periodState }).then((res) => {
      if (cancelled) return;
      setCorrelationCells(res.cells);
    }).catch((err) => {
      if (cancelled) return;
      console.error('[engagement] rating correlation fetch failed', err);
    });
    return () => { cancelled = true; };
  }, [scenarioId, period, from, to]);

  const idx = useMemo(() => blob ? computeInterestIndex(blob) : null, [blob]);

  const slowNodes = useMemo(
    () => stats.filter((s) => s.avg_thinking_time_ms > THRESHOLDS.engagement.slowNodeMs).slice(0, 3),
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
            <LanguageTabs value={language} onChange={setLanguage} />
            <PeriodFilter value={periodState} onChange={setPeriod} />
          </>
        }
      />

      <div className="admin-kpi-row">
        <div style={{ position: 'relative' }}>
          <KpiCard
            label="Interest Index"
            value={idx ? `${idx.score.toFixed(1)}/10` : '—'}
            accent="violet"
            hint="завершаемость + обдумывание + переигровки"
          />
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <FormulaPopover
              title="Формула Interest Index"
              body="Взвешенная сумма трёх компонентов: Completion×0.5 + Thinking×0.3 + Replay×0.2. Каждый компонент в диапазоне 0–10."
            />
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <KpiCard
            label="Completion"
            value={blob ? `${(blob.completion_rate * 100).toFixed(1)}%` : '—'}
            accent="green"
            hint={idx ? `${idx.components.completion.toFixed(1)}/10` : 'доля начавших, кто завершил день'}
          />
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <FormulaPopover
              title="Формула Completion"
              body="Процент игроков, завершивших день после старта. 10% → 1 балл, 100% → 10 баллов."
            />
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <KpiCard
            label="Thinking score"
            value={idx ? `${idx.components.thinking.toFixed(1)}/10` : '—'}
            accent="pink"
            hint={blob?.avg_thinking_time_ms ? `avg ${(blob.avg_thinking_time_ms / 1000).toFixed(1)}с` : 'оптимально 5–15 секунд'}
          />
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <FormulaPopover
              title="Формула Thinking"
              body="Близость среднего времени на выбор к «сладкой зоне» 5–15 сек. <2с или >30с → 0; 5–15с → 10."
            />
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <KpiCard
            label="Replay score"
            value={idx ? `${idx.components.replay.toFixed(1)}/10` : '—'}
            accent="orange"
            hint={blob ? `${(blob.replay_rate * 100).toFixed(1)}%` : '10–30% — здоровая повторяемость'}
          />
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <FormulaPopover
              title="Формула Replay"
              body="Здоровый replay rate 10–30%. Ниже — слабая вовлечённость. Выше 50% — игроки застревают."
            />
          </div>
        </div>
      </div>

      <div className="admin-kpi-row" style={{ marginTop: 8 }}>
        <KpiCard
          label="Время на выбор"
          value={percentiles?.p50_ms != null ? `${Math.round(percentiles.p50_ms / 1000)} сек` : '—'}
          hint={
            percentiles == null
              ? undefined
              : percentiles.sample_size < THRESHOLDS.analytics.minSampleForPercentile
              ? `выборка ${percentiles.sample_size} — мало данных`
              : `p90 ${Math.round((percentiles.p90_ms ?? 0) / 1000)}с · p95 ${Math.round((percentiles.p95_ms ?? 0) / 1000)}с`
          }
          accent="pink"
        />
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>День:</span>
        <DayTabs value={dayId} onChange={setDayId} />
      </div>

      {retention && (
        <div style={{ marginBottom: 16 }}>
          <RetentionCard retention={retention} />
        </div>
      )}

      <div className="admin-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
          Interest Index — тренд по дням
        </div>
        <InterestTrendChart points={trend} />
        <div style={{ fontSize: 10, color: 'var(--admin-text-muted)', marginTop: 6 }}>
          Replay rate усреднён; полный Interest Index — в KPI выше.
        </div>
      </div>

      <div className="admin-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
          Корреляция с S-рейтингом
        </div>
        <RatingCorrelationChart cells={correlationCells} />
      </div>

      <div className="admin-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
          Распределение посещений по узлам ({dayId})
        </div>
        <div style={{ fontSize: 10, color: 'var(--admin-text-muted)', marginBottom: 8 }}>
          Узлы отсортированы по убыванию посещений — кривая показывает drop-off.
        </div>
        {loading ? (
          <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>
            Загружаем…
          </div>
        ) : (
          <HeatCurveChart stats={stats} labels={labels} height={180} />
        )}
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
          <ThinkingBarChart stats={stats} labels={labels} />
        )}
      </div>

      {slowNodes.length > 0 && (
        <InsightCard
          tone="warning"
          title={`${slowNodes.length} «медленных» узлов`}
          body={
            <>
              Игроки задумываются &gt;15с на:{' '}
              {slowNodes.map((n) => (
                <code key={n.node_id} style={{ marginRight: 6 }}>
                  {labels[n.node_id]?.title ?? n.node_id}
                </code>
              ))}
            </>
          }
        />
      )}
    </div>
  );
}
