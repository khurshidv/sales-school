'use client';

import { MessageCircle, Send, Phone } from 'lucide-react';
import { buildWhatsAppUrl, buildTelegramUrl } from '@/lib/admin/outreach';

interface Props {
  phone: string;
  name: string;
}

const iconBtnStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  color: 'var(--admin-text-muted)',
  background: 'transparent',
  textDecoration: 'none',
};

export function OutreachButtons({ phone, name }: Props) {
  return (
    <div style={{ display: 'inline-flex', gap: 2 }} onClick={(e) => e.stopPropagation()}>
      <a href={`tel:${phone}`} title="Позвонить" aria-label="Позвонить" style={iconBtnStyle}>
        <Phone size={12} />
      </a>
      <a
        href={buildWhatsAppUrl(phone, name)}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp"
        aria-label="WhatsApp"
        style={iconBtnStyle}
      >
        <MessageCircle size={12} />
      </a>
      <a
        href={buildTelegramUrl(phone, name)}
        target="_blank"
        rel="noopener noreferrer"
        title="Telegram"
        aria-label="Telegram"
        style={iconBtnStyle}
      >
        <Send size={12} />
      </a>
    </div>
  );
}
