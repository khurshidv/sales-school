'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import InsightCard from '@/components/admin/InsightCard';
import PeriodFilter from '@/components/admin/PeriodFilter';
import FunnelBars from '@/components/admin/charts/FunnelBars';
import { DualTrendChart } from '@/components/admin/overview/DualTrendChart';
import { TopSourcesCard } from '@/components/admin/overview/TopSourcesCard';
import { MoversCard } from '@/components/admin/overview/MoversCard';
import { RealtimeMiniCard } from '@/components/admin/overview/RealtimeMiniCard';
import { fetchOverview } from '@/lib/admin/api';
import type { OverviewTotals, OverviewSparks } from '@/lib/admin/api';
import { computeFunnelDeltas } from '@/lib/admin/marketing/computeFunnelDeltas';
import { pctDelta } from '@/lib/admin/overview/computeDeltas';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import type { DailyTrendRow, OfferFunnel, UtmFunnelRow } from '@/lib/admin/types-v2';
import { THRESHOLDS } from '@/lib/admin/thresholds';

const EMPTY_TOTALS: OverviewTotals = { visitors: 0, registered: 0, started: 0, completed: 0, consultations: 0 };
const EMPTY_SPARKS: OverviewSparks = { visitors: [], registered: [], started: [], completed: [], consultations: [] };

export default function OverviewClient() {
  const [periodState, setPeriod] = usePeriodParam();
  const { period, from, to } = periodState;
  const [current, setCurrent] = useState<OverviewTotals | null>(null);
  const [prev, setPrev] = useState<OverviewTotals | null>(null);
  const [sparks, setSparks] = useState<OverviewSparks>(EMPTY_SPARKS);
  const [trends, setTrends] = useState<DailyTrendRow[]>([]);
  const [utm, setUtm] = useState<UtmFunnelRow[]>([]);
  const [offer, setOffer] = useState<OfferFunnel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOverview(periodState).then((res) => {
      if (cancelled) return;
      setCurrent(res.current);
      setPrev(res.prev);
      setSparks(res.sparks);
      setTrends(res.trends);
      setUtm(res.utm);
      setOffer(res.offer);
      setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      console.error('[overview] fetch failed', err);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [period, from, to]);

  const t = current ?? EMPTY_TOTALS;

  const crVisitorToReg    = t.visitors > 0 ? (t.registered / t.visitors) * 100 : 0;
  const crRegToCompleted  = t.registered > 0 ? (t.completed / t.registered) * 100 : 0;
  const crCompletedToLead = t.completed > 0 ? (t.consultations / t.completed) * 100 : 0;
  const ctr = offer && offer.offer_view > 0
    ? (offer.offer_cta_click / offer.offer_view) * 100 : 0;

  const funnelSteps = useMemo(() => computeFunnelDeltas([
    { label: 'Зарегистрированы',    value: t.registered },
    { label: 'Начали игру',         value: t.started },
    { label: 'Прошли всю игру',     value: t.completed },
    { label: 'Увидели оффер',       value: offer?.offer_view ?? 0 },
    { label: 'Кликнули CTA',        value: offer?.offer_cta_click ?? 0 },
    { label: 'Оставили заявку',     value: t.consultations },
  ]), [t, offer]);

  return (
    <div>
      <PageHeader
        title="Обзор"
        subtitle="Главные показатели воронки и тренды по дням."
        actions={<PeriodFilter value={periodState} onChange={setPeriod} />}
      />

      <div className="admin-kpi-row">
        <KpiCard
          label="Визитёров"
          value={t.visitors.toLocaleString('ru-RU')}
          delta={{ value: pctDelta(t.visitors, prev?.visitors) }}
          sparkline={sparks.visitors}
          accent="blue"
          hint="уникальные просмотры"
        />
        <KpiCard
          label="Регистраций"
          value={t.registered.toLocaleString('ru-RU')}
          delta={{ value: pctDelta(t.registered, prev?.registered) }}
          sparkline={sparks.registered}
          accent="violet"
          hint={`CR ${crVisitorToReg.toFixed(1)}%`}
        />
        <KpiCard
          label="Начали игру"
          value={t.started.toLocaleString('ru-RU')}
          delta={{ value: pctDelta(t.started, prev?.started) }}
          sparkline={sparks.started}
          accent="pink"
        />
        <KpiCard
          label="Прошли всю игру"
          value={t.completed.toLocaleString('ru-RU')}
          delta={{ value: pctDelta(t.completed, prev?.completed) }}
          sparkline={sparks.completed}
          accent="green"
          hint={`CR ${crRegToCompleted.toFixed(1)}%`}
        />
        <KpiCard
          label="Заявок"
          value={t.consultations.toLocaleString('ru-RU')}
          delta={{ value: pctDelta(t.consultations, prev?.consultations) }}
          sparkline={sparks.consultations}
          accent="orange"
          hint={`CR ${crCompletedToLead.toFixed(1)}%`}
        />
        <KpiCard
          label="Оффер CTR"
          value={`${ctr.toFixed(1)}%`}
          accent="violet"
          hint="клики / просмотры оффера"
        />
      </div>

      <div className="admin-two-col">
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
            Регистрации vs прохождения (по дням)
          </div>
          {loading ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>Загружаем…</div>
          ) : (
            <DualTrendChart rows={trends} />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="admin-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
              Воронка
            </div>
            {loading ? (
              <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
            ) : (
              <FunnelBars steps={funnelSteps} />
            )}
          </div>
          <TopSourcesCard utm={utm} />
          <MoversCard rows={trends} />
          <RealtimeMiniCard />
        </div>
      </div>

      {t.registered > 0 && t.completed / t.registered < THRESHOLDS.overview.lowCompletionRate && (
        <InsightCard
          tone="warning"
          title="Низкое прохождение"
          body={
            <>
              Только {((t.completed / t.registered) * 100).toFixed(1)}% игроков завершают игру.
              Посмотри <a href="/admin/dropoff" style={{ textDecoration: 'underline' }}>Drop-off Zones</a>,
              чтобы понять где они отваливаются.
            </>
          }
        />
      )}
    </div>
  );
}
