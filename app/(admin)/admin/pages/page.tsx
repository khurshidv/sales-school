import Link from 'next/link';
import { getPagesSummary } from '@/lib/admin/page-queries';
import DateRangePicker from '@/components/admin/DateRangePicker';
import RefreshButton from '@/components/admin/RefreshButton';
import type { PageSummary } from '@/lib/admin/types';

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

function fmtDuration(ms: number) {
  if (ms < 1000) return '< 1с';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}с`;
  const min = Math.floor(sec / 60);
  const rest = sec % 60;
  return `${min}м ${rest}с`;
}

const PAGE_LABELS: Record<string, { title: string; description: string; color: string }> = {
  home: { title: 'Вебинар', description: 'Лендинг бесплатного вебинара /', color: '#6366f1' },
  target: { title: 'Курс', description: 'Лендинг платного курса /target', color: '#ec4899' },
};

function PageCard({ data }: { data: PageSummary }) {
  const meta = PAGE_LABELS[data.page_slug] ?? {
    title: data.page_slug,
    description: '',
    color: '#6b7280',
  };

  return (
    <Link
      href={`/admin/pages/${data.page_slug}`}
      style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 280 }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          borderTop: `4px solid ${meta.color}`,
          padding: '24px 28px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          cursor: 'pointer',
          transition: 'box-shadow 0.15s',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          {meta.title}
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>{meta.description}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Просмотры</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{fmt(data.total_views)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Уникальные</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{fmt(data.unique_visitors)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Отказы</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: data.bounce_rate > 60 ? '#ef4444' : '#111827' }}>
              {data.bounce_rate}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Конверсия</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: data.conversion_rate > 0 ? '#10b981' : '#111827' }}>
              {data.conversion_rate}%
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f3f4f6', fontSize: 12, color: '#9ca3af' }}>
          Ср. время: {fmtDuration(data.avg_duration_ms)}
        </div>
      </div>
    </Link>
  );
}

export default async function PagesOverview({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const to = sp.to ? new Date(sp.to) : now;
  const from = sp.from ? new Date(sp.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const pages = await getPagesSummary(from, to);

  return (
    <div>
      <div className="admin-page-header">
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#111827' }}>
          Страницы
        </h1>
        <RefreshButton />
      </div>
      <p style={{ color: '#6b7280', marginBottom: 16, fontSize: 14 }}>
        Аналитика маркетинговых страниц
      </p>

      <DateRangePicker />

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {pages.map((p) => (
          <PageCard key={p.page_slug} data={p} />
        ))}
      </div>

      {pages.every((p) => p.total_views === 0) && (
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '40px 32px',
            textAlign: 'center',
            marginTop: 32,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}
        >
          <p style={{ color: '#9ca3af', fontSize: 14 }}>
            Пока нет данных. После запуска трекинга на страницах данные появятся здесь.
          </p>
        </div>
      )}
    </div>
  );
}
