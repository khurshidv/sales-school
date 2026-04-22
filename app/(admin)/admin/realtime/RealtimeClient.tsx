'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import InsightCard from '@/components/admin/InsightCard';
import LiveFeed from '@/components/admin/LiveFeed';
import ActivityAreaChart from '@/components/admin/charts/ActivityAreaChart';
import { fetchRealtimeKpis, fetchRecentEvents, type RealtimeKpis, type RecentGameEvent } from '@/lib/admin/api';
import { detectAutoInsights } from '@/lib/admin/realtime/detectAutoInsights';
import { buildActivitySeries } from '@/lib/admin/realtime/buildActivitySeries';

// Polling every 5s through the admin API (service_role, bypasses RLS).
// Supabase Realtime subscription was removed — it relied on anon client,
// and game_events has no SELECT policy for anon by design (no data leak).
const REFRESH_MS = 5_000;

export default function RealtimeClient() {
  const [kpis, setKpis] = useState<RealtimeKpis>({ active: 0, today: 0, completed_today: 0 });
  const [snapshot, setSnapshot] = useState<RecentGameEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = () => {
      Promise.all([fetchRealtimeKpis(), fetchRecentEvents(60)])
        .then(([k, ev]) => {
          if (cancelled) return;
          setKpis(k); setSnapshot(ev.events); setLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error('[RealtimeClient] fetch failed', err);
          setLoading(false);
        });
    };
    fetchAll();
    const interval = setInterval(fetchAll, REFRESH_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const insights = useMemo(() => detectAutoInsights(snapshot), [snapshot]);
  const activity = useMemo(() => buildActivitySeries(snapshot, 60), [snapshot]);

  const problemNode = insights.find((i) => i.tone === 'danger');

  return (
    <div>
      <PageHeader
        title="В реальном времени"
        subtitle="Что происходит прямо сейчас. Обновляется каждые 5 секунд."
      />

      <div className="admin-kpi-row">
        <KpiCard
          label="Сейчас играют"
          value={kpis.active}
          accent="green"
          hint="heartbeat за 90 сек"
        />
        <KpiCard label="За сегодня" value={kpis.today} accent="violet" />
        <KpiCard label="Прошли игру" value={kpis.completed_today} accent="pink" />
        <KpiCard
          label="Проблемная зона"
          value={problemNode ? '⚠ Есть' : '✓ Норма'}
          accent={problemNode ? 'orange' : 'green'}
          hint={problemNode ? problemNode.body.slice(0, 60) + '…' : undefined}
        />
      </div>

      {insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {insights.map((i) => (
            <InsightCard key={i.id} tone={i.tone} title={i.title} body={i.body} />
          ))}
        </div>
      )}

      <div className="admin-two-col">
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>
              Активность за час
            </div>
            <div style={{ fontSize: 11, color: 'var(--admin-text-dim)' }}>
              {loading ? 'загружаем…' : 'минутные бакеты'}
            </div>
          </div>
          <ActivityAreaChart buckets={activity} />
        </div>

        <div className="admin-card" style={{ padding: 16, maxHeight: 480, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>
              Лента событий
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--admin-text-dim)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              обновляется каждые 5 сек
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <LiveFeed events={snapshot} maxItems={50} />
          </div>
        </div>
      </div>
    </div>
  );
}
