'use client';
import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { fetchRealtimeKpis } from '@/lib/admin/api';
import type { RealtimeKpis } from '@/lib/admin/api';

const POLL_MS = 30_000;

export function RealtimeMiniCard() {
  const [data, setData] = useState<RealtimeKpis | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const json = await fetchRealtimeKpis();
        if (!cancelled) { setData(json); setError(false); }
      } catch {
        if (!cancelled) setError(true);
      }
    }
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <div className="admin-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Radio size={14} style={{ color: 'var(--admin-accent-success)' }} />
          Live
        </div>
        <a href="/admin/realtime" style={{ fontSize: 11, color: 'var(--admin-accent-violet)' }}>
          Открыть →
        </a>
      </div>
      {error ? (
        <div style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>Нет данных</div>
      ) : data === null ? (
        <div style={{ fontSize: 12, color: 'var(--admin-text-dim)' }}>Загружаем…</div>
      ) : (
        <div style={{ display: 'flex', gap: 16 }}>
          <Metric label="Онлайн" value={data.active} />
          <Metric label="Сыграли сегодня" value={data.today} />
          <Metric label="Прошли сегодня" value={data.completed_today} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)' }}>{value.toLocaleString('ru-RU')}</div>
    </div>
  );
}
