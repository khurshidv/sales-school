import type { UtmFunnelV2Row } from '@/lib/admin/api';

export interface StackedBarsProps {
  rows: UtmFunnelV2Row[];
  maxRows?: number;
}

const COLORS = {
  visitorToReg: '#ec4899',
  regToComp:    '#6366f1',
  compToLead:   '#10b981',
};

export function StackedBars({ rows, maxRows = 8 }: StackedBarsProps) {
  const top = [...rows]
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, maxRows)
    .map(r => ({
      segment: r.segment,
      visitors: r.visitors,
      visitorToReg: r.visitors > 0 ? (r.registered / r.visitors) * 100 : 0,
      regToComp:    r.registered > 0 ? (r.completed / r.registered) * 100 : 0,
      compToLead:   r.completed > 0 ? (r.consultations / r.completed) * 100 : 0,
    }));

  if (top.length === 0) {
    return <div style={{ color: 'var(--admin-text-dim)', fontSize: 13, padding: 12 }}>Нет данных</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Legend />
      {top.map(r => (
        <div key={r.segment} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px', gap: 8, alignItems: 'center', fontSize: 11 }}>
          <div style={{ fontWeight: 600, color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.segment}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Stage value={r.visitorToReg} color={COLORS.visitorToReg} label={`${r.visitorToReg.toFixed(0)}%`} />
            <Stage value={r.regToComp}    color={COLORS.regToComp}    label={`${r.regToComp.toFixed(0)}%`} />
            <Stage value={r.compToLead}   color={COLORS.compToLead}   label={`${r.compToLead.toFixed(0)}%`} />
          </div>
          <div style={{ textAlign: 'right', color: 'var(--admin-text-muted)' }}>
            {r.visitors.toLocaleString('ru-RU')} визитов
          </div>
        </div>
      ))}
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: 'flex', gap: 16, fontSize: 10, color: 'var(--admin-text-muted)', marginBottom: 4 }}>
      <Swatch color={COLORS.visitorToReg} label="Визит → Регистрация" />
      <Swatch color={COLORS.regToComp}    label="Регистрация → Прохождение" />
      <Swatch color={COLORS.compToLead}   label="Прохождение → Заявка" />
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 8, background: color, borderRadius: 2 }} />
      {label}
    </span>
  );
}

function Stage({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div style={{ flex: 1, position: 'relative', height: 20, background: 'var(--admin-bg-2)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, value)}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
      <span style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', color: 'white', fontSize: 9, fontWeight: 600, mixBlendMode: 'difference' }}>
        {label}
      </span>
    </div>
  );
}
