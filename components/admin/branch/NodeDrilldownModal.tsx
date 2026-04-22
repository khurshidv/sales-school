'use client';
import Link from 'next/link';
import { AdminModal } from '@/components/admin/shared/AdminModal';
import type { NodeStat, DropoffRow } from '@/lib/admin/types-v2';

export interface NodeDrilldownModalProps {
  open: boolean;
  nodeId: string | null;
  scenarioId: string;
  dayId: string;
  stats: NodeStat[];
  dropoffs: DropoffRow[];
  nodeTitle?: string;
  nodeType?: string;
  nodePreview?: string | null;
  onClose: () => void;
}

export function NodeDrilldownModal({
  open, nodeId, scenarioId, dayId, stats, dropoffs, nodeTitle, nodeType, nodePreview, onClose,
}: NodeDrilldownModalProps) {
  if (!nodeId) return null;
  const stat = stats.find(s => s.node_id === nodeId);
  const drop = dropoffs.find(d => d.node_id === nodeId);
  const entered = stat?.entered_count ?? 0;
  const exits = stat?.exit_count ?? 0;
  const drops = drop?.dropoff_count ?? 0;
  const dropRate = entered > 0 ? (drops / entered) * 100 : 0;
  const avgT = stat?.avg_thinking_time_ms ?? 0;

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      width={560}
      title={<>
        <span style={{ fontSize: 10, color: 'var(--admin-text-muted)', fontWeight: 500, marginRight: 8 }}>
          {nodeType ?? 'node'} · {dayId}
        </span>
        {nodeTitle ?? nodeId}
      </>}
    >
      {nodePreview && (
        <div style={{
          fontSize: 12, color: 'var(--admin-text-muted)', fontStyle: 'italic',
          marginBottom: 12, padding: 12, background: 'var(--admin-bg-2)', borderRadius: 6,
        }}>
          «{nodePreview}»
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 12 }}>
        <Stat label="Входов" value={entered} />
        <Stat label="Выходов" value={exits} />
        <Stat
          label="Drop-off"
          value={drops}
          hint={entered > 0 ? `${dropRate.toFixed(1)}%` : 'нет данных'}
          tone={dropRate >= 30 ? 'danger' : dropRate >= 10 ? 'warn' : 'success'}
        />
        <Stat label="Среднее время" value={`${(avgT / 1000).toFixed(1)}с`} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Link
          href={`/admin/dropoff?scenarioId=${encodeURIComponent(scenarioId)}&day=${encodeURIComponent(dayId)}`}
          className="admin-btn admin-btn--primary"
        >
          Открыть в Drop-off
        </Link>
      </div>
    </AdminModal>
  );
}

function Stat({
  label, value, hint, tone,
}: { label: string; value: string | number; hint?: string; tone?: 'success' | 'warn' | 'danger' }) {
  const color =
    tone === 'danger' ? 'var(--admin-accent-danger)' :
    tone === 'warn' ? 'var(--admin-accent-warn)' :
    tone === 'success' ? 'var(--admin-accent-success)' :
    'var(--admin-text)';
  return (
    <div style={{ padding: 10, background: 'var(--admin-bg-2)', borderRadius: 6 }}>
      <div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
      {hint && <div style={{ fontSize: 10, color, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}
