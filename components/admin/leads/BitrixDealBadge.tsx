'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface DealInfo {
  stage: { label: string; tone: 'default' | 'progress' | 'won' | 'lost' };
  portalUrl: string | null;
}

const TONE: Record<DealInfo['stage']['tone'], { bg: string; color: string }> = {
  default: { bg: '#f1f5f9', color: '#475569' },
  progress: { bg: '#dbeafe', color: '#1e40af' },
  won: { bg: '#dcfce7', color: '#166534' },
  lost: { bg: '#fee2e2', color: '#991b1b' },
};

export function BitrixDealBadge({ dealId }: { dealId: number | null | undefined }) {
  const [info, setInfo] = useState<DealInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!dealId) { setInfo(null); setError(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`/api/admin/bitrix/deal/${dealId}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`status ${r.status}`)))
      .then((d: DealInfo | { deal: null }) => {
        if (cancelled) return;
        if ('deal' in d && d.deal === null) { setInfo(null); return; }
        setInfo(d as DealInfo);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dealId]);

  if (!dealId) {
    return <span style={{ color: 'var(--admin-text-dim)', fontSize: 11 }}>—</span>;
  }
  if (loading) {
    return <span style={{ color: 'var(--admin-text-dim)', fontSize: 11 }}>…</span>;
  }
  if (error || !info) {
    return <span style={{ color: 'var(--admin-text-dim)', fontSize: 11 }} title="Bitrix недоступен">⚠</span>;
  }

  const t = TONE[info.stage.tone];
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <span style={{
        background: t.bg,
        color: t.color,
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        {info.stage.label}
      </span>
      {info.portalUrl && (
        <a
          href={info.portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Открыть в Bitrix"
          title="Открыть сделку в Bitrix"
          style={{ color: 'var(--admin-text-dim)', display: 'inline-flex' }}
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={12} />
        </a>
      )}
    </span>
  );
}
