import type { PageSummary } from '@/lib/admin/types';

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

interface KpiItem {
  label: string;
  value: string;
  accent: string;
}

function KpiCell({ label, value, accent }: KpiItem) {
  return (
    <div className="admin-card" style={{ flex: 1, minWidth: 130, padding: '16px 20px', borderTop: `3px solid ${accent}` }}>
      <div style={{ fontSize: 10, color: 'var(--admin-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--admin-text)' }}>
        {value}
      </div>
    </div>
  );
}

export function PageKpiRow({ summary }: { summary: PageSummary }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <KpiCell label="Просмотры" value={fmt(summary.total_views)} accent="var(--admin-accent-violet)" />
      <KpiCell label="Уникальные" value={fmt(summary.unique_visitors)} accent="#8b5cf6" />
      <KpiCell label="Отказы" value={`${summary.bounce_rate.toFixed(0)}%`} accent={summary.bounce_rate > 60 ? 'var(--admin-accent-warn)' : 'var(--admin-accent-orange, #fb923c)'} />
      <KpiCell label="Ср. время" value={fmtDuration(summary.avg_duration_ms)} accent="var(--admin-accent-success)" />
      <KpiCell label="Конверсия" value={`${summary.conversion_rate.toFixed(1)}%`} accent="var(--admin-accent-pink, #ec4899)" />
    </div>
  );
}
