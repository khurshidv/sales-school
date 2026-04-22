'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

export function ConversionHint() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Что такое конверсия"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16, height: 16,
          padding: 0,
          background: 'transparent',
          border: 0,
          color: 'var(--admin-text-dim)',
          cursor: 'pointer',
          marginLeft: 4,
        }}
      >
        <HelpCircle size={12} />
      </button>
      {open && (
        <div
          className="admin-search-overlay"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="admin-search-modal"
            style={{ maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Что такое «Конверсия»</h3>
                <button
                  type="button"
                  aria-label="Закрыть"
                  className="admin-icon-btn"
                  onClick={() => setOpen(false)}
                >
                  <X size={14} />
                </button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', lineHeight: 1.6, margin: '0 0 8px' }}>
                Конверсия оффер-страницы — доля посетителей оффера, оформивших заявку на покупку.
              </p>
              <div style={{
                background: '#f1f5f9',
                padding: 12,
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'ui-monospace, monospace',
                marginTop: 8,
                color: 'var(--admin-text)',
              }}>
                CR = заявки / просмотры_оффера × 100%
              </div>
              <p style={{ fontSize: 12, color: 'var(--admin-text-dim)', margin: '12px 0 0', lineHeight: 1.5 }}>
                Отличается от CTR (клики / просмотры) — конверсия учитывает только тех,
                кто реально оформил заявку, а не просто кликнул на CTA.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
