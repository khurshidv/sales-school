'use client';

const MEDAL: Record<number, { bg: string; ring: string; emoji: string }> = {
  1: { bg: 'linear-gradient(135deg,#fde047,#facc15)', ring: '#ca8a04', emoji: '🥇' },
  2: { bg: 'linear-gradient(135deg,#e5e7eb,#d1d5db)', ring: '#9ca3af', emoji: '🥈' },
  3: { bg: 'linear-gradient(135deg,#fed7aa,#fdba74)', ring: '#c2410c', emoji: '🥉' },
};

export interface MedalBadgeProps {
  rank: number;
}

export default function MedalBadge({ rank }: MedalBadgeProps) {
  if (rank > 3) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: '50%',
        background: '#f1f5f9', color: 'var(--admin-text-muted)',
        fontSize: 12, fontWeight: 700,
      }}>
        {rank}
      </span>
    );
  }
  const { bg, ring, emoji } = MEDAL[rank];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 32, height: 32, borderRadius: '50%',
      background: bg, border: `2px solid ${ring}`,
      fontSize: 16,
    }}>
      {emoji}
    </span>
  );
}
