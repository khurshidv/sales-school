'use client';

import { useEffect, useRef, useState } from 'react';

const SAVE_DEBOUNCE_MS = 1_000;
const MAX_LENGTH = 10_000;

type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface PlayerNotesProps {
  playerId: string;
  initial: string;
}

export default function PlayerNotes({ playerId, initial }: PlayerNotesProps) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<SaveState>('idle');
  const lastSavedRef = useRef(initial);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value === lastSavedRef.current) return;
    setState('pending');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setState('saving');
      try {
        const res = await fetch('/api/admin/player-notes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, notes: value }),
        });
        if (!res.ok) throw new Error(await res.text());
        lastSavedRef.current = value;
        setState('saved');
        setTimeout(() => setState((s) => (s === 'saved' ? 'idle' : s)), 1500);
      } catch {
        setState('error');
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, playerId]);

  const stateLabel = state === 'pending' ? 'Сохраняем…'
    : state === 'saving' ? 'Сохраняем…'
    : state === 'saved' ? '✓ Сохранено'
    : state === 'error' ? '⚠ Ошибка сохранения'
    : '';
  const stateColor = state === 'error' ? 'var(--admin-accent-danger)'
    : state === 'saved' ? 'var(--admin-accent-success)'
    : 'var(--admin-text-dim)';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>HR-заметки</div>
        <div style={{ fontSize: 11, color: stateColor }}>{stateLabel}</div>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
        placeholder="Заметки админа: впечатления, договорённости, статус контакта…"
        style={{
          width: '100%', minHeight: 100, padding: 10, fontSize: 12,
          border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-sm)',
          background: '#fff', color: 'var(--admin-text)',
          fontFamily: 'inherit', resize: 'vertical',
        }}
      />
      <div style={{ fontSize: 10, color: 'var(--admin-text-dim)', marginTop: 4, textAlign: 'right' }}>
        {value.length} / {MAX_LENGTH}
      </div>
    </div>
  );
}
