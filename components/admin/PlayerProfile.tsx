'use client';

import { useState } from 'react';
import { Phone, MessageCircle, PlayCircle, ExternalLink } from 'lucide-react';
import RatingBadge from './RatingBadge';
import type { PlayerSummary } from '@/lib/admin/types-v2';
import { buildWhatsAppUrl, buildTelegramUrl } from '@/lib/admin/outreach';

export function formatLastSeen(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 0) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) return 'только что';
    return `${hours} ч назад`;
  }
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дней назад`;
  if (days < 30) return `${Math.floor(days / 7)} нед назад`;
  return `${Math.floor(days / 30)} мес назад`;
}

export interface ReplayDayOption {
  dayId: string;
  label: string;
}

export interface PlayerProfileProps {
  player: PlayerSummary;
  bestRating: string | null;
  daysCompleted: number;
  totalSessions: number;
  availableDays?: ReplayDayOption[];
  onReplayDay?: (dayId: string) => void;
  bitrixPortalUrl?: string | null;
}

function ReplayPicker({ days, onReplayDay }: { days: ReplayDayOption[]; onReplayDay: (id: string) => void }) {
  const [selected, setSelected] = useState(days[days.length - 1]?.dayId ?? '');
  if (days.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="admin-btn"
        style={{ minWidth: 90, paddingRight: 20 }}
      >
        {days.map(d => (
          <option key={d.dayId} value={d.dayId}>{d.label}</option>
        ))}
      </select>
      <button type="button" onClick={() => onReplayDay(selected)} className="admin-btn">
        <PlayCircle size={14} /> Replay
      </button>
    </div>
  );
}

export default function PlayerProfile({
  player, bestRating, daysCompleted, totalSessions, availableDays, onReplayDay, bitrixPortalUrl,
}: PlayerProfileProps) {
  return (
    <div className="admin-card" style={{ padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, color: '#fff',
        }}>
          {player.display_name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)' }}>
              {player.display_name}
            </div>
            <RatingBadge rating={bestRating} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 2 }}>
            {player.phone}
            {' · '}
            <span>Регистрация: {new Date(player.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
            {' · '}
            <span>Активность: {formatLastSeen(player.last_seen_at)}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 2 }}>
            UTM: {player.utm_source ?? '(прямой)'}
            {player.utm_medium && ` · ${player.utm_medium}`}
            {player.utm_campaign && ` · ${player.utm_campaign}`}
            {player.referrer && <span title={player.referrer}>{' · реф.'}</span>}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: 'var(--admin-text)' }}>
            <span>⏱️ Сессий: <strong>{totalSessions}</strong></span>
            <span>🎮 Дней пройдено: <strong>{daysCompleted}</strong></span>
            <span>⭐ Очков: <strong>{player.total_score.toLocaleString('ru-RU')}</strong></span>
            <span>🪙 Монет: <strong>{player.coins}</strong></span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <a
            href={buildWhatsAppUrl(player.phone, player.display_name)}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn"
            style={{ background: '#25d366', color: '#fff', borderColor: 'transparent' }}
          >
            <Phone size={14} /> WhatsApp
          </a>
          <a
            href={buildTelegramUrl(player.phone, player.display_name)}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn"
            style={{ background: '#0088cc', color: '#fff', borderColor: 'transparent' }}
          >
            <MessageCircle size={14} /> Telegram
          </a>
          {bitrixPortalUrl && (
            <a
              href={bitrixPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn"
              style={{ background: '#2fc6f6', color: '#fff', borderColor: 'transparent' }}
              title="Открыть сделку в Bitrix"
            >
              <ExternalLink size={14} /> Bitrix
            </a>
          )}
          {availableDays && availableDays.length > 0 && onReplayDay && (
            <ReplayPicker days={availableDays} onReplayDay={onReplayDay} />
          )}
        </div>
      </div>
    </div>
  );
}
