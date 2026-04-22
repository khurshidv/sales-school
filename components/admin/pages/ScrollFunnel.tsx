import type { ScrollDepthEntry } from '@/lib/admin/types';
import type { PageAnnotation } from '@/lib/admin/api';

interface Props {
  data: ScrollDepthEntry[];
  totalViews: number;
  annotations?: PageAnnotation[];
}

export function ScrollFunnel({ data, totalViews, annotations }: Props) {
  const thresholds = [25, 50, 75, 100];
  const depthMap = new Map(data.map((d) => [d.depth, d.count]));
  const max = totalViews || 1;

  const annotBuckets = new Map<number, Array<{ label: string; tone?: string }>>();
  for (const a of annotations ?? []) {
    const bucket = Math.round(a.scroll_depth / 25) * 25;
    const arr = annotBuckets.get(bucket) ?? [];
    arr.push({ label: a.label, tone: a.tone });
    annotBuckets.set(bucket, arr);
  }

  return (
    <>
      {thresholds.map((t) => {
        const count = depthMap.get(t) ?? 0;
        const pct = max > 0 ? Math.round((count / max) * 100) : 0;
        return (
          <div key={t} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--admin-text)', marginBottom: 4 }}>
              <span>{t}% скролла</span>
              <span style={{ fontWeight: 600 }}>
                {count.toLocaleString('ru-RU')}{' '}
                <span style={{ color: 'var(--admin-text-muted)', fontWeight: 400 }}>({pct}%)</span>
              </span>
            </div>
            <div style={{ background: 'var(--admin-border, #f3f4f6)', borderRadius: 6, height: 22, overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(pct, 2)}%`, height: '100%', background: '#8b5cf6', borderRadius: 6 }} />
            </div>
            {(annotBuckets.get(t) ?? []).map((a, i) => (
              <div key={i} style={{
                fontSize: 10, marginTop: 2, fontWeight: 600,
                color: a.tone === 'offer' ? 'var(--admin-accent-violet, #6366f1)' : a.tone === 'cta' ? 'var(--admin-accent-success, #10b981)' : 'var(--admin-text-muted)',
              }}>
                🏷️ {a.label}
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}
