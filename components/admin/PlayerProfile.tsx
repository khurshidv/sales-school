'use client';

import { Phone, MessageCircle, PlayCircle } from 'lucide-react';
import RatingBadge from './RatingBadge';
import type { PlayerSummary } from '@/lib/admin/types-v2';

export interface PlayerProfileProps {
  player: PlayerSummary;
  bestRating: string | null;
  daysCompleted: number;
  totalSessions: number;
  onReplay?: () => void;
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, phone.length - 6)} *** ** ${phone.slice(-2)}`;
}

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent('Здравствуйте! Заметил вас в Sales School.')}`;
}

function telegramLink(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://t.me/+${digits}`;
}

export default function PlayerProfile({
  player, bestRating, daysCompleted, totalSessions, onReplay,
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
            {maskPhone(player.phone)} · UTM: {player.utm_source ?? '(прямой)'}
            {player.utm_campaign && ` / ${player.utm_campaign}`}
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
            href={whatsappLink(player.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn"
            style={{ background: '#25d366', color: '#fff', borderColor: 'transparent' }}
          >
            <Phone size={14} /> WhatsApp
          </a>
          <a
            href={telegramLink(player.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn"
            style={{ background: '#0088cc', color: '#fff', borderColor: 'transparent' }}
          >
            <MessageCircle size={14} /> Telegram
          </a>
          {onReplay && (
            <button onClick={onReplay} className="admin-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
              <PlayCircle size={14} /> Replay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
