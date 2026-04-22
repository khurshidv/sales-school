'use client';
import { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { Breadcrumbs } from '@/components/admin/shared/Breadcrumbs';
import PeriodFilter from '@/components/admin/PeriodFilter';
import { usePeriodParam } from '@/lib/admin/usePeriodParam';
import { fetchPageDetail, type PageDetailPayload } from '@/lib/admin/api';
import { PageKpiRow } from '@/components/admin/pages/PageKpiRow';
import { DailyChart } from '@/components/admin/pages/DailyChart';
import { ScrollFunnel } from '@/components/admin/pages/ScrollFunnel';
import { DeviceBars } from '@/components/admin/pages/DeviceBars';
import { ReferrerTable } from '@/components/admin/pages/ReferrerTable';
import { UtmTable } from '@/components/admin/pages/UtmTable';
import { UtmDrilldownModal } from '@/components/admin/pages/UtmDrilldownModal';
import { AnnotationsDialog } from '@/components/admin/pages/AnnotationsDialog';
import type { UTMBreakdown } from '@/lib/admin/types';

export default function PageDetailClient({ slug }: { slug: string }) {
  const [periodState, setPeriod] = usePeriodParam();
  const [data, setData] = useState<PageDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [utmDrill, setUtmDrill] = useState<UTMBreakdown | null>(null);
  const [annotationsOpen, setAnnotationsOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPageDetail({ slug, period: periodState })
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(err => { if (!cancelled) { console.error('[pages/detail]', err); setLoading(false); } });
    return () => { cancelled = true; };
  }, [slug, periodState.period, periodState.from, periodState.to, reloadKey]);

  const title = data?.title ?? slug;

  return (
    <div>
      <Breadcrumbs items={[{ href: '/admin/pages', label: 'Аналитика лендингов' }, { label: title }]} />
      <PageHeader
        title={title}
        subtitle={`Slug: ${slug}`}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setAnnotationsOpen(true)} className="admin-btn">
              <Tag size={12} /> Аннотации
            </button>
            <PeriodFilter value={periodState} onChange={setPeriod} />
          </div>
        }
      />

      {loading ? (
        <div className="admin-card" style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Загружаем…</div>
      ) : !data ? (
        <div className="admin-card" style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Нет данных</div>
      ) : (
        <>
          <PageKpiRow summary={data.summary} />

          <div className="admin-two-col admin-two-col--equal" style={{ marginTop: 16 }}>
            <div className="admin-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>Просмотры по дням</div>
              <DailyChart data={data.breakdowns.daily_views} />
            </div>
            <div className="admin-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>Глубина скролла</div>
              <ScrollFunnel data={data.breakdowns.scroll_depth} totalViews={data.summary.total_views} annotations={data.annotations} />
            </div>
          </div>

          <div className="admin-two-col admin-two-col--equal" style={{ marginTop: 16 }}>
            <div className="admin-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>Устройства</div>
              <DeviceBars data={data.breakdowns.device_breakdown} conversion={data.device_conversion} />
            </div>
            <div className="admin-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>Топ рефереры</div>
              <ReferrerTable data={data.breakdowns.referrer_breakdown} />
            </div>
          </div>

          <div className="admin-card" style={{ padding: 16, marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>Источники трафика (UTM)</div>
            <UtmTable data={data.breakdowns.utm_breakdown} onRowClick={setUtmDrill} />
          </div>
        </>
      )}

      <UtmDrilldownModal
        open={!!utmDrill}
        row={utmDrill}
        periodState={periodState}
        onClose={() => setUtmDrill(null)}
      />

      <AnnotationsDialog
        open={annotationsOpen}
        slug={slug}
        onClose={() => setAnnotationsOpen(false)}
        onSaved={() => setReloadKey(k => k + 1)}
      />
    </div>
  );
}
