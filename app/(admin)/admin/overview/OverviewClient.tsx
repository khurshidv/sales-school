'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import InsightCard from '@/components/admin/InsightCard';
import PeriodFilter from '@/components/admin/PeriodFilter';
import FunnelBars from '@/components/admin/charts/FunnelBars';
import TrendLineChart from '@/components/admin/charts/TrendLineChart';
import { fetchOverview } from '@/lib/admin/api';
import { computeFunnelDeltas } from '@/lib/admin/marketing/computeFunnelDeltas';
import type { DailyTrendRow, OfferFunnel, UtmFunnelRow, Period } from '@/lib/admin/types-v2';

export default function OverviewClient() {
  const [period, setPeriod] = useState<Period>('30d');
  const [trends, setTrends] = useState<DailyTrendRow[]>([]);
  const [utm, setUtm] = useState<UtmFunnelRow[]>([]);
  const [offer, setOffer] = useState<OfferFunnel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOverview(period).then((res) => {
      if (cancelled) return;
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
  }, [period]);

  const totals = useMemo(() => {
    return utm.reduce(
      (acc, r) => ({
        visitors: acc.visitors + r.visitors,
        registered: acc.registered + r.registered,
        started: acc.started + r.started,
        completed: acc.completed + r.completed,
        consultations: acc.consultations + r.consultations,
      }),
      { visitors: 0, registered: 0, started: 0, completed: 0, consultations: 0 },
    );
  }, [utm]);

  const funnelSteps = useMemo(() => computeFunnelDeltas([
    { label: 'Зарегистрированы',    value: totals.registered },
    { label: 'Начали игру',         value: totals.started },
    { label: 'Прошли всю игру',     value: totals.completed },
    { label: 'Увидели оффер',       value: offer?.offer_view ?? 0 },
    { label: 'Кликнули CTA',        value: offer?.offer_cta_click ?? 0 },
    { label: 'Оставили заявку',     value: totals.consultations },
  ]), [totals, offer]);

  return (
    <div>
      <PageHeader
        title="Обзор"
        subtitle="Главные показатели воронки и тренды по дням."
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Игроков" value={totals.registered.toLocaleString('ru-RU')} accent="violet" />
        <KpiCard label="Начали игру" value={totals.started.toLocaleString('ru-RU')} accent="pink" />
        <KpiCard label="Прошли всю игру" value={totals.completed.toLocaleString('ru-RU')} accent="green" />
        <KpiCard
          label="Оставили заявку"
          value={totals.consultations.toLocaleString('ru-RU')}
          accent="orange"
          hint="попап после игры"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
            Динамика по дням
          </div>
          {loading ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)' }}>Загружаем…</div>
          ) : (
            <TrendLineChart rows={trends} />
          )}
        </div>
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
      </div>

      {totals.registered > 0 && totals.completed / totals.registered < 0.1 && (
        <InsightCard
          tone="warning"
          title="Низкое прохождение"
          body={
            <>
              Только {((totals.completed / totals.registered) * 100).toFixed(1)}% игроков завершают игру.
              Посмотри <a href="/admin/dropoff" style={{ textDecoration: 'underline' }}>Drop-off Zones</a>,
              чтобы понять где они отваливаются.
            </>
          }
        />
      )}
    </div>
  );
}
