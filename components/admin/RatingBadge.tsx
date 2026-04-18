'use client';

const COLORS: Record<string, { bg: string; color: string }> = {
  S: { bg: 'linear-gradient(135deg,#fef3c7,#fde68a)', color: '#92400e' },
  A: { bg: '#dcfce7', color: '#065f46' },
  B: { bg: '#dbeafe', color: '#1e40af' },
  C: { bg: '#fee2e2', color: '#991b1b' },
  F: { bg: '#f3f4f6', color: '#6b7280' },
};

export interface RatingBadgeProps {
  rating: string | null;
  size?: 'sm' | 'md';
}

export default function RatingBadge({ rating, size = 'md' }: RatingBadgeProps) {
  if (!rating) {
    return (
      <span style={{
        display: 'inline-block', padding: size === 'sm' ? '2px 8px' : '4px 10px',
        background: '#f1f5f9', color: '#94a3b8',
        borderRadius: 999, fontSize: size === 'sm' ? 10 : 12, fontWeight: 700,
      }}>
        —
      </span>
    );
  }
  const { bg, color } = COLORS[rating] ?? COLORS.F;
  return (
    <span style={{
      display: 'inline-block', padding: size === 'sm' ? '2px 8px' : '4px 10px',
      background: bg, color,
      borderRadius: 999, fontSize: size === 'sm' ? 10 : 12, fontWeight: 800,
      letterSpacing: 0.5,
    }}>
      {rating}
    </span>
  );
}
