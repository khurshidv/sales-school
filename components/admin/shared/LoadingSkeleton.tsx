'use client';

type Variant = 'kpi-row' | 'table' | 'chart' | 'card';

interface Props {
  variant: Variant;
  rows?: number;
}

export function LoadingSkeleton({ variant, rows = 5 }: Props) {
  if (variant === 'kpi-row') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="admin-card admin-skeleton" style={{ height: 104 }} />
        ))}
      </div>
    );
  }
  if (variant === 'table') {
    return (
      <div className="admin-card">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="admin-skeleton" style={{ height: 40, marginBottom: 8 }} />
        ))}
      </div>
    );
  }
  if (variant === 'chart') {
    return <div className="admin-card admin-skeleton" style={{ height: 280 }} />;
  }
  return <div className="admin-card admin-skeleton" style={{ height: 160 }} />;
}
