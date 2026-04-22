'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface AdminModalProps {
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}

export function AdminModal({ open, title, onClose, width = 640, children }: AdminModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--admin-bg)', borderRadius: 12, padding: 24,
          width, maxWidth: '90vw', maxHeight: '85vh',
          display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)' }}>{title}</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-dim)' }}
            aria-label="Закрыть"
          ><X size={16} /></button>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
