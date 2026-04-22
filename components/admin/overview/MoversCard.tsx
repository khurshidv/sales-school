import type { DailyTrendRow } from '@/lib/admin/types-v2';

const MIN_REG_FOR_MOVER = 5;

export interface MoversCardProps {
  rows: DailyTrendRow[];
}

interface MoverStat {
  date: string;
  completionRate: number;
  registered: number;
  completed: number;
}

function toMover(r: DailyTrendRow): MoverStat | null {
  if (r.registered < MIN_REG_FOR_MOVER) return null;
  return {
    date: r.bucket_date,
    registered: r.registered,
    completed: r.game_completed,
    completionRate: r.registered > 0 ? (r.game_completed / r.registered) * 100 : 0,
  };
}

export function MoversCard({ rows }: MoversCardProps) {
  const movers = rows
    .map(toMover)
    .filter((m): m is MoverStat => m !== null)
    .sort((a, b) => b.completionRate - a.completionRate);

  if (movers.length === 0) {
    return (
      <div className="admin-card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--admin-text)' }}>
          Лучший и худший день
        </div>
        <div style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>
          Нет дней с ≥{MIN_REG_FOR_MOVER} регистраций
        </div>
      </div>
    );
  }

  const best = movers[0];
  const worst = movers[movers.length - 1];
  const sameDay = best.date === worst.date;

  return (
    <div className="admin-card" style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--admin-text)' }}>
        Лучший и худший день
      </div>
      <Row
        tone="success"
        label="Лучший"
        mover={best}
      />
      {!sameDay && (
        <Row
          tone="danger"
          label="Худший"
          mover={worst}
        />
      )}
    </div>
  );
}

function Row({ tone, label, mover }: { tone: 'success' | 'danger'; label: string; mover: MoverStat }) {
  const color = tone === 'success' ? 'var(--admin-accent-success)' : 'var(--admin-accent-danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--admin-border)' }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{mover.date}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color }}>{mover.completionRate.toFixed(1)}%</div>
        <div style={{ fontSize: 10, color: 'var(--admin-text-dim)' }}>
          {mover.completed} из {mover.registered}
        </div>
      </div>
    </div>
  );
}
