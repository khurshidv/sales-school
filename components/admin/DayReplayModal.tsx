'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PlayerJourneyEvent } from '@/lib/admin/types-v2';
import { fetchNodeLabels } from '@/lib/admin/api';

export interface DayReplayModalProps {
  events: PlayerJourneyEvent[];
  dayLabel: string;
  onClose: () => void;
}

const EVENT_LABEL: Record<string, string> = {
  game_started: 'Игра запущена',
  day_started: 'День начат',
  day_completed: 'День завершён',
  day_failed: 'День провален',
  choice_made: 'Сделан выбор',
  back_navigation: 'Шаг назад',
  dialogue_reread: 'Перечитал диалог',
  game_completed: 'Игра завершена',
  achievement_unlocked: 'Получено достижение',
  node_entered: 'Перешёл на узел',
  node_exited: 'Покинул узел',
  heartbeat: 'Активен',
  idle_detected: 'Бездействие',
  dropped_off: 'Покинул игру',
};

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function DayReplayModal({ events, dayLabel, onClose }: DayReplayModalProps) {
  const [idx, setIdx] = useState(0);
  const [labels, setLabels] = useState<Record<string, { title: string; preview: string | null }>>({});

  const scenarioId = useMemo(
    () => events.find(e => e.scenario_id)?.scenario_id ?? null,
    [events],
  );

  useEffect(() => {
    if (!scenarioId || events.length === 0) return;
    const ids = new Set<string>();
    for (const e of events) {
      const d = e.event_data;
      const nodeId = (d as { node_id?: string }).node_id;
      const fromNode = (d as { from_node_id?: string }).from_node_id;
      const toNode = (d as { to_node_id?: string }).to_node_id;
      if (nodeId) ids.add(nodeId);
      if (fromNode) ids.add(fromNode);
      if (toNode) ids.add(toNode);
    }
    if (ids.size === 0) return;
    let cancelled = false;
    fetchNodeLabels(scenarioId, Array.from(ids))
      .then(res => {
        if (cancelled) return;
        const simplified: Record<string, { title: string; preview: string | null }> = {};
        for (const [id, label] of Object.entries(res.labels)) {
          simplified[id] = { title: label.title, preview: label.preview };
        }
        setLabels(simplified);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [scenarioId, events]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(events.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [events.length, onClose]);

  if (events.length === 0) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <Header dayLabel={dayLabel} onClose={onClose} />
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--admin-text-dim)' }}>
            Нет событий для этого дня.
          </div>
        </div>
      </div>
    );
  }

  const current = events[idx];
  const data = current.event_data;
  const label = EVENT_LABEL[current.event_type] ?? current.event_type;
  const detail = formatDetail(current.event_type, data, labels);
  const currentNodeId = (current.event_data as { node_id?: string }).node_id;
  const currentPreview = currentNodeId ? labels[currentNodeId]?.preview : null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <Header dayLabel={dayLabel} onClose={onClose} />

        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--admin-text-dim)', marginBottom: 8 }}>
            Шаг {idx + 1} из {events.length} · {fmtTime(current.created_at)}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 6 }}>
            {label}
          </div>
          {detail && (
            <div style={{ fontSize: 13, color: 'var(--admin-text-muted)', whiteSpace: 'pre-wrap' }}>
              {detail}
            </div>
          )}
          {currentPreview && (
            <div style={{
              marginTop: 12,
              padding: 10,
              background: '#f8fafc',
              borderLeft: '3px solid var(--admin-accent)',
              fontSize: 12,
              color: 'var(--admin-text-muted)',
              fontStyle: 'italic',
              whiteSpace: 'pre-wrap',
            }}>
              «{currentPreview}»
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="admin-btn"
              style={idx === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            >
              <ChevronLeft size={14} /> Назад
            </button>
            <button
              onClick={() => setIdx((i) => Math.min(events.length - 1, i + 1))}
              disabled={idx === events.length - 1}
              className="admin-btn admin-btn-primary"
              style={idx === events.length - 1 ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            >
              Вперёд <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ marginTop: 16, height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              width: `${((idx + 1) / events.length) * 100}%`, height: '100%',
              background: 'linear-gradient(90deg, var(--admin-accent), var(--admin-accent-2))',
              transition: 'width 0.2s',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ dayLabel, onClose }: { dayLabel: string; onClose: () => void }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 24px', borderBottom: '1px solid var(--admin-border)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>
        Replay: {dayLabel}
      </div>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
        aria-label="Закрыть"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function formatDetail(
  type: string,
  data: Record<string, unknown>,
  labels: Record<string, { title: string; preview: string | null }>,
): string {
  function renderNodeRef(nodeId: string | undefined): string {
    if (!nodeId) return '?';
    const label = labels[nodeId];
    if (!label) return nodeId; // fallback to raw id if not yet loaded
    return label.title;
  }

  if (type === 'choice_made') {
    const nodeId = data.node_id as string | undefined;
    const choiceId = data.choice_id;
    const tt = data.thinking_time_ms;
    const parts: string[] = [];
    if (nodeId) parts.push(`Узел: ${renderNodeRef(nodeId)}`);
    if (choiceId) parts.push(`Выбор: ${choiceId}`);
    if (typeof tt === 'number') parts.push(`Время: ${(tt / 1000).toFixed(1)}с`);
    return parts.join('\n');
  }
  if (type === 'back_navigation') {
    return `${renderNodeRef(data.from_node_id as string | undefined)} → ${renderNodeRef(data.to_node_id as string | undefined)}`;
  }
  if (type === 'node_entered' || type === 'node_exited') {
    const nodeId = data.node_id as string | undefined;
    const ts = data.time_spent_ms;
    return [
      nodeId ? `Узел: ${renderNodeRef(nodeId)}` : null,
      typeof ts === 'number' ? `На узле провёл: ${(ts / 1000).toFixed(1)}с` : null,
    ].filter(Boolean).join('\n');
  }
  return '';
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(15, 23, 42, 0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1100, padding: 20,
};

const modalStyle: React.CSSProperties = {
  background: 'var(--admin-card)',
  borderRadius: 'var(--admin-radius-lg)',
  width: '100%', maxWidth: 560,
  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
};
