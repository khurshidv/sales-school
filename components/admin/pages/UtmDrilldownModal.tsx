'use client';
import Link from 'next/link';
import { AdminModal } from '@/components/admin/shared/AdminModal';
import type { UTMBreakdown } from '@/lib/admin/types';
import type { Period } from '@/lib/admin/types-v2';
import type { PeriodParamState } from '@/lib/admin/usePeriodParam';

export interface UtmDrilldownModalProps {
  open: boolean;
  row: UTMBreakdown | null;
  periodState: Period | PeriodParamState;
  onClose: () => void;
}

export function UtmDrilldownModal({ open, row, periodState, onClose }: UtmDrilldownModalProps) {
  if (!row) return null;

  const periodStr = typeof periodState === 'string' ? periodState : periodState.period;
  const fromStr = typeof periodState === 'object' && (periodState as PeriodParamState).from ? (periodState as PeriodParamState).from : null;
  const toStr = typeof periodState === 'object' && (periodState as PeriodParamState).to ? (periodState as PeriodParamState).to : null;

  const funnelHref = (() => {
    const sp = new URLSearchParams();
    sp.set('dim', 'utm_source');
    sp.set('period', periodStr);
    if (fromStr) sp.set('from', fromStr);
    if (toStr) sp.set('to', toStr);
    return `/admin/funnel?${sp.toString()}`;
  })();

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      width={520}
      title={
        <>
          <span style={{ fontSize: 10, color: 'var(--admin-text-muted)', fontWeight: 500, marginRight: 8 }}>UTM</span>
          {row.source || 'direct'}
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 12 }}>
        <Field label="Источник" value={row.source || '—'} />
        <Field label="Канал" value={row.medium || '—'} />
        <Field label="Кампания" value={row.campaign || '—'} />
        <Field label="Просмотры" value={row.views.toLocaleString('ru-RU')} strong />
        <Field label="Уникальные" value={row.unique_visitors.toLocaleString('ru-RU')} strong />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Link href={funnelHref} className="admin-btn admin-btn--primary">
          Открыть в воронке
        </Link>
      </div>
    </AdminModal>
  );
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ padding: 10, background: 'var(--admin-bg-2)', borderRadius: 6 }}>
      <div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>{label}</div>
      <div style={{
        fontSize: strong ? 16 : 13,
        fontWeight: strong ? 700 : 500,
        color: 'var(--admin-text)',
        marginTop: 2,
      }}>{value}</div>
    </div>
  );
}
