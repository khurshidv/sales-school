'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AdminModal } from '@/components/admin/shared/AdminModal';
import { fetchPageAnnotations, updatePageAnnotations, type PageAnnotation } from '@/lib/admin/api';

export interface AnnotationsDialogProps {
  open: boolean;
  slug: string;
  onClose: () => void;
  onSaved?: () => void;
}

export function AnnotationsDialog({ open, slug, onClose, onSaved }: AnnotationsDialogProps) {
  const [items, setItems] = useState<PageAnnotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchPageAnnotations(slug)
      .then(r => { setItems(r.annotations); setError(null); })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [open, slug]);

  function update(idx: number, patch: Partial<PageAnnotation>) {
    setItems(prev => prev.map((a, i) => i === idx ? { ...a, ...patch } : a));
  }
  function add() {
    setItems(prev => [...prev, { scroll_depth: 50, label: '', tone: 'info' }]);
  }
  function remove(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function save() {
    setError(null);
    const trimmed = items
      .map(a => ({ ...a, label: a.label.trim() }))
      .filter(a => a.label.length > 0);
    for (const a of trimmed) {
      if (a.scroll_depth < 0 || a.scroll_depth > 100) {
        setError('scroll_depth должен быть 0..100');
        return;
      }
    }
    try {
      setSaving(true);
      await updatePageAnnotations(slug, trimmed);
      onSaved?.();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal open={open} onClose={onClose} width={640} title="Аннотации скролл-воронки">
      {loading ? (
        <div style={{ color: 'var(--admin-text-dim)', fontSize: 13 }}>Загружаем…</div>
      ) : (
        <>
          {error && <div style={{ color: 'var(--admin-accent-danger)', fontSize: 12, marginBottom: 8 }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.length === 0 && (
              <div style={{ color: 'var(--admin-text-dim)', fontSize: 12, padding: 12, textAlign: 'center' }}>
                Нет аннотаций — нажмите «Добавить», чтобы пометить важные зоны страницы (где оффер, CTA и т.д.).
              </div>
            )}
            {items.map((a, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 32px', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={a.scroll_depth}
                  onChange={e => update(i, { scroll_depth: Number(e.target.value) })}
                  style={inputStyle}
                />
                <input
                  type="text"
                  value={a.label}
                  placeholder="Метка (например, «Оффер»)"
                  onChange={e => update(i, { label: e.target.value })}
                  style={inputStyle}
                />
                <select
                  value={a.tone ?? 'info'}
                  onChange={e => update(i, { tone: e.target.value as PageAnnotation['tone'] })}
                  style={inputStyle}
                >
                  <option value="info">Инфо</option>
                  <option value="offer">Оффер</option>
                  <option value="cta">CTA</option>
                </select>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-accent-danger)', padding: 4 }}
                  aria-label="Удалить"
                ><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'space-between' }}>
            <button type="button" onClick={add} className="admin-btn">
              <Plus size={12} /> Добавить
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={onClose} className="admin-btn" disabled={saving}>Отмена</button>
              <button type="button" onClick={save} className="admin-btn admin-btn--primary" disabled={saving}>
                {saving ? 'Сохраняем…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </>
      )}
    </AdminModal>
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
