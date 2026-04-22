import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface DeltaBadgeProps {
  value: number | null;
  invert?: boolean;
  size?: 'sm' | 'md';
}

export function DeltaBadge({ value, invert, size = 'md' }: DeltaBadgeProps) {
  if (value === null || !Number.isFinite(value)) {
    return <span style={{ fontSize: size === 'sm' ? 10 : 11, color: 'var(--admin-text-dim)' }}>—</span>;
  }
  const isPositive = invert ? value < 0 : value > 0;
  const isZero = Math.abs(value) < 0.05;
  const color = isZero ? 'var(--admin-text-muted)' :
    isPositive ? 'var(--admin-accent-success)' : 'var(--admin-accent-danger)';
  const Icon = isZero ? Minus : (isPositive ? TrendingUp : TrendingDown);
  const px = size === 'sm' ? 4 : 6;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: size === 'sm' ? 10 : 11, fontWeight: 600, color,
      padding: `${px / 2}px ${px}px`, borderRadius: 6,
      background: isZero ? 'transparent' : `${color}14`,
    }}>
      <Icon size={size === 'sm' ? 10 : 12} />
      {value > 0 ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
}
