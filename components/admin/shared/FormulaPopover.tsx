'use client';
import { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';

export interface FormulaPopoverProps {
  title: string;
  body: React.ReactNode;
}

export function FormulaPopover({ title, body }: FormulaPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: 'var(--admin-text-dim)', display: 'inline-flex' }}
        aria-label="Показать формулу"
      ><Info size={12} /></button>
      {open && (
        <div
          role="dialog"
          style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 100,
            background: 'var(--admin-bg-2)', border: '1px solid var(--admin-border)',
            padding: 12, borderRadius: 8, minWidth: 260, maxWidth: 320, fontSize: 11,
            color: 'var(--admin-text)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
          <div style={{ lineHeight: 1.5 }}>{body}</div>
        </div>
      )}
    </span>
  );
}
