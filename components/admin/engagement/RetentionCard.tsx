import type { RetentionSummary } from '@/lib/admin/api';
import { THRESHOLDS } from '@/lib/admin/thresholds';

export function RetentionCard({ retention }: { retention: RetentionSummary }) {
  const d1Pct = retention.d1_rate * 100;
  const d7Pct = retention.d7_rate * 100;
  const d1Healthy = retention.d1_rate >= THRESHOLDS.retention.healthyD1;
  const d7Healthy = retention.d7_rate >= THRESHOLDS.retention.healthyD7;

  return (
    <div className="admin-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>Retention (D1 / D7)</div>
        <div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>
          {retention.cohort_size === 0 ? 'нет когорт' : `когорта ${retention.cohort_size.toLocaleString('ru-RU')}`}
        </div>
      </div>
      <Row label="D1 (вернулись через день)" pct={d1Pct} target={THRESHOLDS.retention.healthyD1 * 100} healthy={d1Healthy} />
      <Row label="D7 (вернулись через неделю)" pct={d7Pct} target={THRESHOLDS.retention.healthyD7 * 100} healthy={d7Healthy} />
    </div>
  );
}

function Row({ label, pct, target, healthy }: { label: string; pct: number; target: number; healthy: boolean }) {
  const color = healthy ? 'var(--admin-accent-success)' : 'var(--admin-accent-warn)';
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--admin-text-muted)', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: 'var(--admin-text)', fontWeight: 700 }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ position: 'relative', height: 6, background: 'var(--admin-bg-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
        <div style={{ position: 'absolute', left: `${Math.min(100, target)}%`, top: -2, bottom: -2, width: 1, background: 'var(--admin-text-muted)' }} title={`Цель ${target.toFixed(0)}%`} />
      </div>
    </div>
  );
}
