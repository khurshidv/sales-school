import Link from 'next/link';
import { getPageAnalytics, getPageTitle } from '@/lib/admin/page-queries';
import type {
  PageSummary,
  PageBreakdowns,
  UTMBreakdown,
  DeviceBreakdown,
  ReferrerBreakdown,
  ScrollDepthEntry,
  DailyViews,
} from '@/lib/admin/types';

function fmt(n: number) {
  return n.toLocaleString('ru-RU');
}

function fmtDuration(ms: number) {
  if (ms < 1000) return '< 1с';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}с`;
  const min = Math.floor(sec / 60);
  const rest = sec % 60;
  return `${min}м ${rest}с`;
}

// ─── KPI Card ───

function KpiCard({ label, value, suffix, color }: { label: string; value: string; suffix?: string; color: string }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '20px 24px',
        borderTop: `4px solid ${color}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        flex: 1,
        minWidth: 150,
      }}
    >
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>
        {value}
        {suffix && <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}> {suffix}</span>}
      </div>
    </div>
  );
}

// ─── Section Wrapper ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '24px 28px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}
    >
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: '#111827' }}>{title}</h2>
      {children}
    </div>
  );
}

// ─── Bar Component ───

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const width = max > 0 ? Math.max((value / max) * 100, 2) : 2;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600 }}>{fmt(value)}</span>
      </div>
      <div style={{ background: '#f3f4f6', borderRadius: 6, height: 22, overflow: 'hidden' }}>
        <div style={{ width: `${width}%`, height: '100%', background: color, borderRadius: 6 }} />
      </div>
    </div>
  );
}

// ─── UTM Table ───

function UTMTable({ data }: { data: UTMBreakdown[] }) {
  if (data.length === 0) {
    return <p style={{ color: '#9ca3af', fontSize: 13 }}>Нет данных по UTM</p>;
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
            {['Источник', 'Канал', 'Кампания', 'Просмотры', 'Уникальные'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
              <td style={{ padding: '8px 12px', fontWeight: 500 }}>{row.source}</td>
              <td style={{ padding: '8px 12px', color: '#6b7280' }}>{row.medium}</td>
              <td style={{ padding: '8px 12px', color: '#6b7280' }}>{row.campaign}</td>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{fmt(row.views)}</td>
              <td style={{ padding: '8px 12px' }}>{fmt(row.unique_visitors)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Referrer Table ───

function ReferrerTable({ data }: { data: ReferrerBreakdown[] }) {
  if (data.length === 0) {
    return <p style={{ color: '#9ca3af', fontSize: 13 }}>Нет данных по рефереру</p>;
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
            <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', fontWeight: 600 }}>Реферер</th>
            <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', fontWeight: 600 }}>Визиты</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
              <td style={{ padding: '8px 12px', fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.referrer}
              </td>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{fmt(row.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Device Breakdown ───

function DeviceBars({ data }: { data: DeviceBreakdown[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const colors: Record<string, string> = { mobile: '#6366f1', desktop: '#10b981', tablet: '#f59e0b', unknown: '#9ca3af' };
  const labels: Record<string, string> = { mobile: 'Мобильные', desktop: 'Десктоп', tablet: 'Планшеты', unknown: 'Неизвестно' };

  if (data.length === 0) {
    return <p style={{ color: '#9ca3af', fontSize: 13 }}>Нет данных</p>;
  }

  return (
    <>
      {data.map((d) => (
        <Bar key={d.device_type} label={labels[d.device_type] ?? d.device_type} value={d.count} max={max} color={colors[d.device_type] ?? '#6b7280'} />
      ))}
    </>
  );
}

// ─── Scroll Depth Funnel ───

function ScrollFunnel({ data, totalViews }: { data: ScrollDepthEntry[]; totalViews: number }) {
  const thresholds = [25, 50, 75, 100];
  const depthMap = new Map(data.map((d) => [d.depth, d.count]));
  const max = totalViews || 1;

  return (
    <>
      {thresholds.map((t) => {
        const count = depthMap.get(t) ?? 0;
        const pct = max > 0 ? Math.round((count / max) * 100) : 0;
        return (
          <div key={t} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151', marginBottom: 4 }}>
              <span>{t}% скролла</span>
              <span style={{ fontWeight: 600 }}>{fmt(count)} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({pct}%)</span></span>
            </div>
            <div style={{ background: '#f3f4f6', borderRadius: 6, height: 22, overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(pct, 2)}%`, height: '100%', background: '#8b5cf6', borderRadius: 6 }} />
            </div>
          </div>
        );
      })}
    </>
  );
}

// ─── Daily Views Chart ───

function DailyChart({ data }: { data: DailyViews[] }) {
  if (data.length === 0) {
    return <p style={{ color: '#9ca3af', fontSize: 13 }}>Нет данных</p>;
  }

  const max = Math.max(...data.map((d) => d.views), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
      {data.map((d) => {
        const height = Math.max((d.views / max) * 100, 3);
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.views} просмотров, ${d.unique_visitors} уникальных`}
            style={{
              flex: 1,
              minWidth: 8,
              maxWidth: 24,
              height: `${height}%`,
              background: '#6366f1',
              borderRadius: '4px 4px 0 0',
              cursor: 'default',
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Date Range Selector ───

function DateRangeInfo({ from, to }: { from: string; to: string }) {
  return (
    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
      Период: {from} — {to}
    </div>
  );
}

// ─── Main Page ───

export default async function PageDetailDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const now = new Date();
  const to = sp.to ? new Date(sp.to) : now;
  const from = sp.from ? new Date(sp.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [{ summary, breakdowns }, title] = await Promise.all([
    getPageAnalytics(slug, from, to),
    getPageTitle(slug),
  ]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Link href="/admin/pages" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>
          ← Страницы
        </Link>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: '#111827' }}>
        {title}
      </h1>
      <DateRangeInfo from={from.toLocaleDateString('ru-RU')} to={to.toLocaleDateString('ru-RU')} />

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <KpiCard label="Просмотры" value={fmt(summary.total_views)} color="#6366f1" />
        <KpiCard label="Уникальные" value={fmt(summary.unique_visitors)} color="#8b5cf6" />
        <KpiCard label="Отказы" value={`${summary.bounce_rate}%`} color={summary.bounce_rate > 60 ? '#ef4444' : '#f59e0b'} />
        <KpiCard label="Ср. время" value={fmtDuration(summary.avg_duration_ms)} color="#10b981" />
        <KpiCard label="Конверсия" value={`${summary.conversion_rate}%`} color="#ec4899" />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 24 }}>
        <Section title="Просмотры по дням">
          <DailyChart data={breakdowns.daily_views} />
        </Section>

        <Section title="Глубина скролла">
          <ScrollFunnel data={breakdowns.scroll_depth} totalViews={summary.total_views} />
        </Section>

        <Section title="Устройства">
          <DeviceBars data={breakdowns.device_breakdown} />
        </Section>

        <Section title="Топ рефереры">
          <ReferrerTable data={breakdowns.referrer_breakdown} />
        </Section>
      </div>

      {/* UTM Table — full width */}
      <Section title="Источники трафика (UTM)">
        <UTMTable data={breakdowns.utm_breakdown} />
      </Section>

      {summary.total_views === 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '40px 32px', textAlign: 'center', marginTop: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>
            Нет данных за выбранный период. Трекинг активен — данные появятся после первых посещений.
          </p>
        </div>
      )}
    </div>
  );
}
