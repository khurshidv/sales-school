'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import PlayerProfile, { type ReplayDayOption } from '@/components/admin/PlayerProfile';
import Timeline, { type TimelineItem, type TimelineTone } from '@/components/admin/Timeline';
import PerDayBars from '@/components/admin/charts/PerDayBars';
import InsightCard from '@/components/admin/InsightCard';
import PlayerNotes from '@/components/admin/PlayerNotes';
import DayReplayModal from '@/components/admin/DayReplayModal';
import { Breadcrumbs } from '@/components/admin/shared/Breadcrumbs';
import { fetchPlayer, fetchParticipantPhoneLookup } from '@/lib/admin/api';
import { formatLastSeen } from '@/components/admin/PlayerProfile';
import { parseJourney } from '@/lib/admin/player/parseJourney';
import { deriveStrengthsWeaknesses } from '@/lib/admin/player/deriveStrengthsWeaknesses';
import type { PlayerSummary, PlayerJourneyEvent, CompletedDay } from '@/lib/admin/types-v2';

export interface PlayerClientProps {
  playerId: string;
}

const EVENT_TONE: Record<string, TimelineTone> = {
  game_started: 'success',
  day_started: 'info',
  day_completed: 'success',
  day_failed: 'danger',
  choice_made: 'success',
  back_navigation: 'warning',
  dialogue_reread: 'warning',
  dropped_off: 'danger',
  game_completed: 'success',
  achievement_unlocked: 'success',
  node_entered: 'neutral',
  node_exited: 'neutral',
  heartbeat: 'neutral',
  idle_detected: 'warning',
};

const EVENT_LABEL: Record<string, string> = {
  game_started: 'Игра запущена',
  day_started: 'День начат',
  day_completed: 'День завершён',
  day_failed: 'День провален',
  choice_made: 'Выбор',
  back_navigation: 'Шаг назад',
  dialogue_reread: 'Перечитал диалог',
  dropped_off: 'Покинул игру',
  game_completed: 'Игра завершена',
  achievement_unlocked: 'Получил достижение',
  node_entered: 'Перешёл на узел',
  node_exited: 'Покинул узел',
  heartbeat: 'Активен',
  idle_detected: 'Бездействие',
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function eventToTimelineItem(e: PlayerJourneyEvent, idx: number): TimelineItem {
  const data = e.event_data;
  let title: string = EVENT_LABEL[e.event_type] ?? e.event_type;
  let meta: string | null = null;
  if (e.event_type === 'choice_made') {
    const nodeId = (data as { node_id?: string }).node_id;
    const tt = (data as { thinking_time_ms?: number }).thinking_time_ms;
    title = `Выбор на узле ${nodeId ?? '?'}`;
    if (tt) meta = `Время на размышление: ${(tt / 1000).toFixed(1)}с`;
  } else if (e.event_type === 'day_completed' || e.event_type === 'day_failed') {
    title = `${EVENT_LABEL[e.event_type]} (${e.day_id ?? ''})`;
  } else if (e.event_type === 'back_navigation') {
    const from = (data as { from_node_id?: string }).from_node_id;
    const to = (data as { to_node_id?: string }).to_node_id;
    title = `Шаг назад: ${from ?? '?'} → ${to ?? '?'}`;
  } else if (e.day_id) {
    meta = `день ${e.day_id}`;
  }
  return {
    id: `${idx}-${e.event_type}-${e.created_at}`,
    title,
    meta,
    timestamp: fmtTime(e.created_at),
    tone: EVENT_TONE[e.event_type] ?? 'neutral',
  };
}

export default function PlayerClient({ playerId }: PlayerClientProps) {
  const [player, setPlayer] = useState<PlayerSummary | null>(null);
  const [events, setEvents] = useState<PlayerJourneyEvent[]>([]);
  const [completed, setCompleted] = useState<CompletedDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [replayDayId, setReplayDayId] = useState<string | null>(null);
  const [bitrixPortalUrl, setBitrixPortalUrl] = useState<string | null>(null);
  const [showSystemEvents, setShowSystemEvents] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setNotFound(false);
    fetchPlayer(playerId)
      .then((res) => {
        if (cancelled) return;
        if (!res.summary) setNotFound(true);
        setPlayer(res.summary); setEvents(res.journey); setCompleted(res.completedDays); setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[PlayerClient] fetchPlayer failed', err);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [playerId]);

  useEffect(() => {
    if (!player?.phone) { setBitrixPortalUrl(null); return; }
    let cancelled = false;
    fetchParticipantPhoneLookup([player.phone])
      .then(data => {
        const info = data.leadsByPhone[player.phone];
        if (!info?.bitrixDealId) { if (!cancelled) setBitrixPortalUrl(null); return; }
        return fetch(`/api/admin/bitrix/deal/${info.bitrixDealId}`)
          .then(r => r.ok ? r.json() : null)
          .then((d: { portalUrl?: string | null } | null) => {
            if (!cancelled) setBitrixPortalUrl(d?.portalUrl ?? null);
          });
      })
      .catch(() => { if (!cancelled) setBitrixPortalUrl(null); });
    return () => { cancelled = true; };
  }, [player?.phone]);

  const SYSTEM_EVENTS = new Set(['heartbeat', 'node_entered', 'node_exited']);

  const journey = useMemo(() => parseJourney(events), [events]);
  const insight = useMemo(
    () => player ? deriveStrengthsWeaknesses(journey, completed) : null,
    [journey, completed, player],
  );
  const bestRating = useMemo(() => {
    if (completed.length === 0) return null;
    const order: Record<string, number> = { S: 1, A: 2, B: 3, C: 4, F: 5 };
    return [...completed].map((c) => c.rating).sort((a, b) => (order[a] ?? 99) - (order[b] ?? 99))[0];
  }, [completed]);

  const availableDays: ReplayDayOption[] = useMemo(
    () => journey.days.map(d => ({
      dayId: d.day_id,
      label: d.day_id.replace(/^day/i, 'День '),
    })),
    [journey.days],
  );

  const visibleEvents = useMemo(
    () => showSystemEvents ? events : events.filter(e => !SYSTEM_EVENTS.has(e.event_type)),
    [events, showSystemEvents],
  );

  const items = useMemo(
    () => visibleEvents.map((e, i) => eventToTimelineItem(e, i)),
    [visibleEvents],
  );

  if (loading) {
    return <div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>;
  }
  if (notFound || !player) {
    return (
      <div>
        <PageHeader title="Игрок не найден" subtitle={`ID: ${playerId}`} />
        <div className="admin-card" style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-dim)' }}>
          Этот игрок не существует или был удалён.
        </div>
      </div>
    );
  }

  const recommendationTone = insight?.recommendation === 'hire'
    ? 'success' : insight?.recommendation === 'train' ? 'warning' : 'danger';
  const recommendationTitle = insight?.recommendation === 'hire'
    ? 'Связаться в течение 24 часов'
    : insight?.recommendation === 'train' ? 'Пригласить на обучение' : 'Пропустить';

  return (
    <div>
      <Breadcrumbs
        items={[
          { href: '/admin/participants', label: 'Участники' },
          { label: player.display_name || 'Игрок' },
        ]}
      />
      <PageHeader
        title="Путь игрока"
        subtitle={`${player.phone} · активность ${formatLastSeen(player.last_seen_at)}`}
      />

      <PlayerProfile
        player={player}
        bestRating={bestRating}
        daysCompleted={completed.length}
        totalSessions={journey.totalSessions}
        availableDays={availableDays.length > 0 ? availableDays : undefined}
        onReplayDay={availableDays.length > 0 ? (dayId) => setReplayDayId(dayId) : undefined}
        bitrixPortalUrl={bitrixPortalUrl}
      />

      <div className="admin-two-col">
        <div className="admin-card" style={{ padding: 16, maxHeight: 600, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>
              Таймлайн ({visibleEvents.length} из {events.length} событий)
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--admin-text-muted)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showSystemEvents}
                onChange={(e) => setShowSystemEvents(e.target.checked)}
              />
              Показать служебные
            </label>
          </div>
          <Timeline items={items} emptyText="Нет событий — игрок не начинал игру." />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="admin-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>
              Прогресс по дням
            </div>
            <PerDayBars days={completed} />
          </div>

          {insight && (insight.strengths.length > 0 || insight.weaknesses.length > 0) && (
            <div className="admin-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>
                Сильные / слабые стороны
              </div>
              {insight.strengths.map((s, i) => (
                <div key={`s-${i}`} style={{ fontSize: 11, color: 'var(--admin-accent-success)', margin: '4px 0' }}>
                  ✓ {s}
                </div>
              ))}
              {insight.weaknesses.map((w, i) => (
                <div key={`w-${i}`} style={{ fontSize: 11, color: 'var(--admin-accent-warn)', margin: '4px 0' }}>
                  ⚠ {w}
                </div>
              ))}
            </div>
          )}

          {insight && (
            <InsightCard
              tone={recommendationTone}
              title={`🎯 ${recommendationTitle}`}
              body={insight.recommendationReason}
            />
          )}

          <div className="admin-card" style={{ padding: 16 }}>
            <PlayerNotes playerId={playerId} initial={player.admin_notes ?? ''} />
          </div>
        </div>
      </div>

      {replayDayId && (() => {
        const dayObj = journey.days.find((d) => d.day_id === replayDayId);
        if (!dayObj) return null;
        return (
          <DayReplayModal
            events={dayObj.events}
            dayLabel={dayObj.day_id.replace('day', 'День ')}
            onClose={() => setReplayDayId(null)}
          />
        );
      })()}
    </div>
  );
}
