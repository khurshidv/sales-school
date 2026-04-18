'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import PeriodFilter from '@/components/admin/PeriodFilter';
import { getPagesSummary } from '@/lib/admin/page-queries';
import { periodToRange } from '@/lib/admin/queries-v2';
import type { PageSummary } from '@/lib/admin/types';
import type { Period } from '@/lib/admin/types-v2';

function fmt(n: number) {
  return n.toLocaleString('ru-RU');
}

function fmtDuration(ms: number) {
  if (ms < 1000) return '0с';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}с`;
  return `${Math.floor(s / 60)}м ${s % 60}с`;
}

interface PageCardProps {
  data: PageSummary;
}

function PageCard({ data }: PageCardProps) {
  return (
    <div className="admin-card" style={{ padding: 16, minWidth: 240 }}>
      <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
        /{data.page_slug}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', margin: '4px 0' }}>
        {fmt(data.total_views)}
      </div>
      <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>просмотров</div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12,
        fontSize: 11, color: 'var(--admin-text-muted)',
      }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: 13 }}>{fmt(data.unique_visitors)}</div>
          <div>Уник. визиторов</div>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: 13 }}>{fmtDuration(data.avg_duration_ms)}</div>
          <div>Среднее время</div>
        </div>
        <div>
          <div style={{
            fontWeight: 700, fontSize: 13,
            color: data.bounce_rate > 60 ? 'var(--admin-accent-warn)' : 'var(--admin-text)',
          }}>{data.bounce_rate.toFixed(0)}%</div>
          <div>Bounce</div>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--admin-accent-success)', fontSize: 13 }}>{data.conversion_rate.toFixed(1)}%</div>
          <div>В заявку</div>
        </div>
      </div>
    </div>
  );
}

export default function PagesClient() {
  const [period, setPeriod] = useState<Period>('30d');
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const range = periodToRange(period);
    const from = range.from ? new Date(range.from) : new Date(Date.now() - 30 * 86400_000);
    const to = range.to ? new Date(range.to) : new Date();
    getPagesSummary(from, to).then((p) => {
      if (cancelled) return;
      setPages(p); setLoading(false);
    });
    return () => { cancelled = true; };
  }, [period]);

  const totalViews = pages.reduce((acc, p) => acc + p.total_views, 0);
  const totalUnique = pages.reduce((acc, p) => acc + p.unique_visitors, 0);
  const avgBounce = pages.length > 0 ? pages.reduce((a, p) => a + p.bounce_rate, 0) / pages.length : 0;

  return (
    <div>
      <PageHeader
        title="Pages Analytics"
        subtitle="Поведение на маркетинговых лендингах — просмотры, bounce, конверсия."
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiCard label="Всего просмотров" value={totalViews.toLocaleString('ru-RU')} accent="violet" />
        <KpiCard label="Уник. визиторов" value={totalUnique.toLocaleString('ru-RU')} accent="pink" />
        <KpiCard label="Средний bounce" value={`${avgBounce.toFixed(0)}%`} accent="orange" />
      </div>

      {loading ? (
        <div className="admin-card" style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Загружаем…</div>
      ) : (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {pages.map((p) => <PageCard key={p.page_slug} data={p} />)}
        </div>
      )}

      {!loading && pages.every((p) => p.total_views === 0) && (
        <div className="admin-card" style={{ padding: 28, textAlign: 'center', marginTop: 16, color: 'var(--admin-text-dim)', fontSize: 13 }}>
          Пока нет данных. Включи трекинг страниц с помощью <code>initPageTracking()</code>.
        </div>
      )}
    </div>
  );
}
