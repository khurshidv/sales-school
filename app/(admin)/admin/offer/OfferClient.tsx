'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import InsightCard from '@/components/admin/InsightCard';
import PeriodFilter from '@/components/admin/PeriodFilter';
import FunnelBars from '@/components/admin/charts/FunnelBars';
import { fetchOffer } from '@/lib/admin/api';
import { computeFunnelDeltas } from '@/lib/admin/marketing/computeFunnelDeltas';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import type { OfferFunnel, OfferBreakdownRow } from '@/lib/admin/types-v2';
import { THRESHOLDS } from '@/lib/admin/thresholds';
import { ConversionHint } from '@/components/admin/offer/ConversionHint';

export default function OfferClient() {
  const [periodState, setPeriod] = usePeriodParam();
  const { period, from, to } = periodState;
  const [funnel, setFunnel] = useState<OfferFunnel | null>(null);
  const [byRating, setByRating] = useState<OfferBreakdownRow[]>([]);
  const [byUtm, setByUtm] = useState<OfferBreakdownRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOffer(periodState).then((res) => {
      if (cancelled) return;
      setFunnel(res.funnel); setByRating(res.byRating); setByUtm(res.byUtm); setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      console.error('[offer] fetch failed', err);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [period, from, to]);

  const steps = useMemo(() => computeFunnelDeltas([
    { label: 'Прошли всю игру', value: funnel?.game_completed ?? 0 },
    { label: 'Увидели оффер',   value: funnel?.offer_view ?? 0 },
    { label: 'Кликнули CTA',    value: funnel?.offer_cta_click ?? 0 },
    { label: 'Конверсия',       value: funnel?.offer_conversion ?? 0 },
  ]), [funnel]);

  const ctr = funnel && funnel.offer_view > 0
    ? (funnel.offer_cta_click / funnel.offer_view) * 100
    : 0;

  const cr = funnel && funnel.offer_view > 0
    ? (funnel.offer_conversion / funnel.offer_view) * 100
    : 0;

  const bestRating = useMemo(() => {
    return [...byRating].sort((a, b) => {
      const ra = a.views > 0 ? a.clicks / a.views : 0;
      const rb = b.views > 0 ? b.clicks / b.views : 0;
      return rb - ra;
    })[0];
  }, [byRating]);

  return (
    <div>
      <PageHeader
        title="Offer Conversion"
        subtitle="Финальная оффер-страница — кто видит, кто кликает, кто конвертируется."
        actions={<PeriodFilter value={periodState} onChange={setPeriod} />}
      />

      <div className="admin-kpi-row">
        <KpiCard label="Просмотров оффера" value={funnel?.offer_view ?? 0} accent="violet" />
        <KpiCard label="Кликов CTA" value={funnel?.offer_cta_click ?? 0} accent="pink" />
        <KpiCard
          label="CTR"
          value={`${ctr.toFixed(1)}%`}
          accent="green"
          hint="кликов / просмотров"
        />
        <div style={{ position: 'relative' }}>
          <KpiCard
            label="CR"
            value={`${cr.toFixed(1)}%`}
            accent="green"
            hint="заявки / просмотры"
          />
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <ConversionHint />
          </div>
        </div>
        <KpiCard
          label="Лучший rating"
          value={bestRating?.segment ?? '—'}
          hint={bestRating && bestRating.views > 0 ? `${((bestRating.clicks / bestRating.views) * 100).toFixed(0)}% CTR` : undefined}
          accent="orange"
        />
      </div>

      {ctr < THRESHOLDS.offer.lowCtrThreshold * 100 && funnel && funnel.offer_view > THRESHOLDS.offer.minViewsForStat && (
        <div style={{ marginBottom: 16 }}>
          <InsightCard
            tone="danger"
            title="Низкий CTR"
            body="CTR ниже 5% при значительном трафике. Стоит пересмотреть текст CTA или оффер целиком."
          />
        </div>
      )}

      <div className="admin-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
          Воронка оффера
        </div>
        {loading ? (
          <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
        ) : (
          <FunnelBars steps={steps} />
        )}
      </div>

      <div className="admin-two-col admin-two-col--equal">
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
            CTR по рейтингу игрока
          </div>
          {loading ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
          ) : byRating.length === 0 ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Нет данных</div>
          ) : (
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Rating</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Views</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Clicks</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>CTR</th>
                </tr>
              </thead>
              <tbody>
                {byRating.map((r) => {
                  const rate = r.views > 0 ? (r.clicks / r.views) * 100 : 0;
                  return (
                    <tr key={r.segment} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: 600 }}>{r.segment}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.views}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.clicks}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700 }}>{rate.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
            CTR по UTM-источнику
          </div>
          {loading ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Загружаем…</div>
          ) : byUtm.length === 0 ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 20 }}>Нет данных</div>
          ) : (
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Источник</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Views</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>Clicks</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--admin-text-muted)' }}>CTR</th>
                </tr>
              </thead>
              <tbody>
                {byUtm.map((r) => {
                  const rate = r.views > 0 ? (r.clicks / r.views) * 100 : 0;
                  return (
                    <tr key={r.segment} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: 600 }}>{r.segment}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.views}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>{r.clicks}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700 }}>{rate.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
