'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
      setLastRefresh(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Tashkent' }));
    });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {lastRefresh && (
        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          обновлено {lastRefresh}
        </span>
      )}
      <button
        onClick={handleRefresh}
        disabled={isPending}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          fontSize: 13,
          fontWeight: 500,
          border: '1px solid #d1d5db',
          borderRadius: 8,
          background: '#fff',
          color: isPending ? '#9ca3af' : '#374151',
          cursor: isPending ? 'default' : 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 16,
            animation: isPending ? 'spin 0.8s linear infinite' : 'none',
          }}
        >
          refresh
        </span>
        {isPending ? 'Обновление...' : 'Обновить'}
      </button>
    </div>
  );
}
