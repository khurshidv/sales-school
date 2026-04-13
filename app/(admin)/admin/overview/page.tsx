import { getFunnelStats } from '@/lib/admin/queries';

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

function pct(part: number, total: number) {
  if (total === 0) return '—';
  return `${Math.round((part / total) * 100)}%`;
}

interface KpiCardProps {
  label: string;
  value: number;
  conversion?: string;
  color: string;
}

function KpiCard({ label, value, conversion, color }: KpiCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '24px 28px',
        borderTop: `4px solid ${color}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        minWidth: 180,
        flex: 1,
      }}
    >
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#111827' }}>{fmt(value)}</div>
      {conversion && (
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Конв: <strong>{conversion}</strong>
        </div>
      )}
    </div>
  );
}

interface FunnelBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  conversionLabel: string;
}

function FunnelBar({ label, value, max, color, conversionLabel }: FunnelBarProps) {
  const width = max > 0 ? Math.max((value / max) * 100, 2) : 2;
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
          fontSize: 14,
          color: '#374151',
        }}
      >
        <span>{label}</span>
        <span style={{ fontWeight: 600 }}>
          {fmt(value)} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({conversionLabel})</span>
        </span>
      </div>
      <div style={{ background: '#f3f4f6', borderRadius: 6, height: 28, overflow: 'hidden' }}>
        <div
          style={{
            width: `${width}%`,
            height: '100%',
            background: color,
            borderRadius: 6,
            transition: 'width 0.3s',
          }}
        />
      </div>
    </div>
  );
}

export default async function OverviewPage() {
  const stats = await getFunnelStats();
  const max = Math.max(stats.visitors, stats.registered, stats.started, stats.completed, 1);

  const funnelSteps = [
    {
      label: 'Начали игру',
      value: stats.visitors,
      color: '#6366f1',
      conversion: '100%',
    },
    {
      label: 'Зарегистрированы (имя + тел)',
      value: stats.registered,
      color: '#8b5cf6',
      conversion: pct(stats.registered, stats.visitors),
    },
    {
      label: 'Начали первый день',
      value: stats.started,
      color: '#ec4899',
      conversion: pct(stats.started, stats.visitors),
    },
    {
      label: 'Завершили сценарий',
      value: stats.completed,
      color: '#f59e0b',
      conversion: pct(stats.completed, stats.visitors),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#111827' }}>
        Обзор
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 14 }}>
        Воронка и ключевые метрики по всем игрокам
      </p>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
        <KpiCard label="Начали игру" value={stats.visitors} color="#6366f1" />
        <KpiCard
          label="Зарегистрированы"
          value={stats.registered}
          color="#8b5cf6"
          conversion={pct(stats.registered, stats.visitors)}
        />
        <KpiCard
          label="Начали День 1"
          value={stats.started}
          color="#ec4899"
          conversion={pct(stats.started, stats.visitors)}
        />
        <KpiCard
          label="Завершили сценарий"
          value={stats.completed}
          color="#f59e0b"
          conversion={pct(stats.completed, stats.visitors)}
        />
      </div>

      {/* Funnel Chart */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '28px 32px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          maxWidth: 700,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#111827' }}>
          Воронка конверсии
        </h2>
        {funnelSteps.map((step) => (
          <FunnelBar
            key={step.label}
            label={step.label}
            value={step.value}
            max={max}
            color={step.color}
            conversionLabel={step.conversion}
          />
        ))}
        {stats.visitors === 0 && (
          <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 16, fontSize: 14 }}>
            Пока нет данных. Когда игроки начнут игру, воронка заполнится.
          </p>
        )}
      </div>
    </div>
  );
}
