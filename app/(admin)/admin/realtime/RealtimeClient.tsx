'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pause, Play } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import InsightCard from '@/components/admin/InsightCard';
import LiveFeed from '@/components/admin/LiveFeed';
import ActivityAreaChart from '@/components/admin/charts/ActivityAreaChart';
import { EventFilter, EVENT_GROUP_TYPES } from '@/components/admin/realtime/EventFilter';
import { fetchRealtimeKpis, fetchRecentEvents, type RealtimeKpis, type RecentGameEvent } from '@/lib/admin/api';
import { detectAutoInsights } from '@/lib/admin/realtime/detectAutoInsights';
import { buildActivitySeries } from '@/lib/admin/realtime/buildActivitySeries';
import { THRESHOLDS } from '@/lib/admin/thresholds';
import { notificationsEnabled, notify } from '@/lib/admin/realtime/notify';
import { NotificationToggle } from '@/components/admin/realtime/NotificationToggle';

// Polling every 5s through the admin API (service_role, bypasses RLS).
// Supabase Realtime subscription was removed — it relied on anon client,
// and game_events has no SELECT policy for anon by design (no data leak).
const REFRESH_MS = 5_000;

function eventKey(e: RecentGameEvent): string {
  return `${e.created_at}|${e.player_id}|${e.event_type}`;
}

export default function RealtimeClient() {
  const router = useRouter();
  const [kpis, setKpis] = useState<RealtimeKpis>({ active: 0, today: 0, completed_today: 0 });
  const [snapshot, setSnapshot] = useState<RecentGameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [paused, setPaused] = useState(false);
  const [lastSeenKey, setLastSeenKey] = useState<string | null>(null);

  useEffect(() => {
    if (paused) return;
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
  }, [paused]);

  useEffect(() => {
    if (snapshot.length === 0) return;
    const headKey = eventKey(snapshot[0]);
    if (lastSeenKey === null) {
      // first poll — don't notify, just set baseline
      setLastSeenKey(headKey);
      return;
    }
    if (headKey === lastSeenKey) return;

    // Find all events newer than lastSeenKey
    const newerIdx = snapshot.findIndex(e => eventKey(e) === lastSeenKey);
    const fresh = newerIdx === -1 ? snapshot : snapshot.slice(0, newerIdx);

    if (notificationsEnabled()) {
      for (const e of fresh) {
        const name = e.display_name ?? `игрок ${e.player_id.slice(0, 4)}`;
        if (e.event_type === 'game_completed') {
          notify('🏆 Игрок завершил игру', name);
        } else if (e.event_type === 'dropped_off') {
          notify('⚠ Игрок ушёл', name);
        }
      }
    }
    setLastSeenKey(headKey);
  }, [snapshot, lastSeenKey]);

  const insights = useMemo(() => detectAutoInsights(snapshot), [snapshot]);
  const activity = useMemo(() => buildActivitySeries(snapshot, 60), [snapshot]);

  const problemNode = insights.find((i) => i.tone === 'danger');

  const visibleEvents = useMemo(() => {
    const allowed = EVENT_GROUP_TYPES[filter] ?? [];
    return filter === 'all' ? snapshot : snapshot.filter(e => allowed.includes(e.event_type));
  }, [snapshot, filter]);

  return (
    <div>
      <PageHeader
        title="В реальном времени"
        subtitle="Что происходит прямо сейчас. Обновляется каждые 5 секунд."
        actions={<NotificationToggle />}
      />

      {problemNode && (
        <div style={{ marginBottom: 12 }}>
          <InsightCard tone="danger" title={problemNode.title} body={problemNode.body} />
        </div>
      )}

      <div className="admin-kpi-row">
        <KpiCard
          label="Онлайн сейчас"
          value={kpis.active}
          accent="green"
          hint={`heartbeat за ${THRESHOLDS.heartbeat.liveWindowSeconds}с`}
        />
        <KpiCard
          label="Сыграли сегодня"
          value={kpis.today}
          accent="violet"
          hint="уникальных игроков с 00:00"
        />
        <KpiCard
          label="Прошли сегодня"
          value={kpis.completed_today}
          accent="pink"
          hint="завершили сценарий"
        />
      </div>

      {insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {insights.filter(i => i.id !== problemNode?.id).map((i) => (
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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>Лента событий</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--admin-text-dim)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: paused ? '#94a3b8' : '#22c55e', boxShadow: paused ? 'none' : '0 0 6px #22c55e' }} />
              {paused ? 'пауза' : `обновляется каждые ${REFRESH_MS / 1000} сек`}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
            <EventFilter active={filter} onChange={setFilter} />
            <button
              onClick={() => setPaused(!paused)}
              className="admin-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              {paused ? <Play size={12} /> : <Pause size={12} />}
              {paused ? 'Продолжить' : 'Пауза'}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <LiveFeed
              events={visibleEvents}
              maxItems={50}
              onRowClick={(id) => router.push(`/admin/player/${id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
