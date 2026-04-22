// lib/admin/outreach.ts — isomorphic (no 'server-only', no React)

export interface OutreachTemplates {
  whatsapp: string;
  telegram: string;
}

export const DEFAULT_TEMPLATES: OutreachTemplates = {
  whatsapp: 'Здравствуйте, {name}! Это Sales School — вы оставили заявку на наш курс. Удобно обсудить программу и стоимость?',
  telegram: 'Здравствуйте, {name}! Это Sales School. Удобно обсудить ваш запрос?',
};

export function renderTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
}

export function buildWhatsAppUrl(phone: string, name: string, tpl: string = DEFAULT_TEMPLATES.whatsapp): string {
  const digits = normalizePhone(phone);
  const text = encodeURIComponent(renderTemplate(tpl, { name }));
  return `https://wa.me/${digits}?text=${text}`;
}

export function buildTelegramUrl(phone: string, _name: string): string {
  // Telegram doesn't support prefilled text via phone URL; links open the chat only
  // if the user's account is associated with this phone. Falls back to search.
  const digits = normalizePhone(phone);
  return `https://t.me/+${digits}`;
}
