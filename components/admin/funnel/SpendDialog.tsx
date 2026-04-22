'use client';

import { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import {
  fetchUtmSpendList,
  upsertUtmSpend,
  deleteUtmSpend,
  type UtmSpendRow,
} from '@/lib/admin/api';

export interface SpendDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful mutation so the parent can refetch funnel data. */
  onChange?: () => void;
}

export function SpendDialog({ open, onClose, onChange }: SpendDialogProps) {
  const [rows, setRows] = useState<UtmSpendRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    bucket_date: new Date().toISOString().slice(0, 10),
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    amount_kzt: '',
    note: '',
  });

  async function reload() {
    setLoading(true);
    try {
      const r = await fetchUtmSpendList();
      setRows(r.rows);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (open) void reload();
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await upsertUtmSpend({
        bucket_date: form.bucket_date,
        utm_source: form.utm_source.trim(),
        utm_medium: form.utm_medium.trim() || null,
        utm_campaign: form.utm_campaign.trim() || null,
        amount_kzt: Number(form.amount_kzt),
        note: form.note.trim() || null,
      });
      setForm({ ...form, utm_source: '', utm_medium: '', utm_campaign: '', amount_kzt: '', note: '' });
      await reload();
      onChange?.();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(id: string) {
    try {
      await deleteUtmSpend(id);
      await reload();
      onChange?.();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--admin-card)',
          borderRadius: 'var(--admin-radius-lg)',
          padding: 24,
          width: 680,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--admin-text)' }}>
            Расходы на рекламу
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={submit}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}
        >
          <input
            type="date"
            value={form.bucket_date}
            onChange={(e) => setForm({ ...form, bucket_date: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            placeholder="source"
            value={form.utm_source}
            onChange={(e) => setForm({ ...form, utm_source: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            placeholder="medium"
            value={form.utm_medium}
            onChange={(e) => setForm({ ...form, utm_medium: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="campaign"
            value={form.utm_campaign}
            onChange={(e) => setForm({ ...form, utm_campaign: e.target.value })}
            style={inputStyle}
          />
          <input
            type="number"
            min="0"
            step="1"
            placeholder="KZT"
            value={form.amount_kzt}
            onChange={(e) => setForm({ ...form, amount_kzt: e.target.value })}
            required
            style={inputStyle}
          />
          <button type="submit" className="admin-btn admin-btn--primary">
            Добавить
          </button>
        </form>

        {error && (
          <div style={{ color: 'var(--admin-accent-danger)', fontSize: 12 }}>{error}</div>
        )}

        <div style={{ overflow: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Загружаем…</div>
          ) : rows.length === 0 ? (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Нет записей</div>
          ) : (
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <th style={thStyle}>Дата</th>
                  <th style={thStyle}>Source</th>
                  <th style={thStyle}>Medium</th>
                  <th style={thStyle}>Campaign</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>KZT</th>
                  <th style={{ width: 28 }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={tdStyle}>{r.bucket_date}</td>
                    <td style={tdStyle}>{r.utm_source}</td>
                    <td style={tdStyle}>{r.utm_medium ?? '—'}</td>
                    <td style={tdStyle}>{r.utm_campaign ?? '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>
                      {r.amount_kzt.toLocaleString('ru-RU')}
                    </td>
                    <td>
                      <button
                        onClick={() => remove(r.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--admin-accent-danger)',
                        }}
                        title="Удалить"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '6px 8px',
  fontSize: 12,
  border: '1px solid var(--admin-border)',
  borderRadius: 6,
  background: 'var(--admin-bg-2)',
  color: 'var(--admin-text)',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 4px',
  color: 'var(--admin-text-muted)',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '6px 4px',
  color: 'var(--admin-text)',
};
