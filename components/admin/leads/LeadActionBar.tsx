'use client';

import { useState } from 'react';
import { Copy, UserCheck, X } from 'lucide-react';
import { useToast } from '@/components/admin/shared/ToastProvider';
import { LEAD_STATUS_CONFIG } from './LeadStatusBadge';

interface Props {
  selectedIds: string[];
  selectedPhones: string[];
  onClear: () => void;
  onRefresh: () => void;
}

const STATUS_ACTIONS: Array<{ value: 'in_progress' | 'done' | 'invalid' }> = [
  { value: 'in_progress' },
  { value: 'done' },
  { value: 'invalid' },
];

export function LeadActionBar({ selectedIds, selectedPhones, onClear, onRefresh }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  if (selectedIds.length === 0) return null;

  function copyPhones() {
    const text = selectedPhones.join('\n');
    navigator.clipboard.writeText(text).then(
      () => toast.push({ tone: 'success', title: `${selectedPhones.length} номеров скопировано` }),
      () => toast.push({ tone: 'danger', title: 'Не удалось скопировать' }),
    );
  }

  async function bulkStatus(status: string) {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action: 'status', value: status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'unknown' }));
        throw new Error((err as { error?: string }).error ?? 'failed');
      }
      const { updated } = (await res.json()) as { updated: number };
      toast.push({ tone: 'success', title: `Обновлено: ${updated}` });
      onRefresh();
      onClear();
    } catch (e) {
      toast.push({ tone: 'danger', title: 'Не удалось обновить', description: String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-action-bar">
      <span style={{ fontWeight: 600 }}>Выбрано: {selectedIds.length}</span>
      <button type="button" className="admin-btn" onClick={copyPhones} disabled={busy}>
        <Copy size={12} /> Скопировать номера
      </button>
      {STATUS_ACTIONS.map(a => (
        <button
          key={a.value}
          type="button"
          className="admin-btn"
          onClick={() => bulkStatus(a.value)}
          disabled={busy}
        >
          <UserCheck size={12} /> {LEAD_STATUS_CONFIG[a.value].label}
        </button>
      ))}
      <button type="button" className="admin-btn" onClick={onClear} disabled={busy}>
        <X size={12} /> Отменить
      </button>
    </div>
  );
}
