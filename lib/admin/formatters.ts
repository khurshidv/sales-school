export function fmt(n: number) {
  return n.toLocaleString('en-US');
}

export function fmtDuration(ms: number) {
  if (ms < 1000) return '< 1с';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}с`;
  const min = Math.floor(sec / 60);
  const rest = sec % 60;
  return `${min}м ${rest}с`;
}

export function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

/**
 * Masks a phone number for privacy: +998 90 123-45-67 → +998 90 ***-**-67
 * Shows first 6 and last 2 characters, masks the rest.
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone;
  const visible = 4;
  const start = phone.slice(0, visible);
  const end = phone.slice(-2);
  const masked = phone.slice(visible, -2).replace(/\d/g, '*');
  return `${start}${masked}${end}`;
}

export function pct(part: number, total: number): string {
  if (total === 0) return '—';
  return `${Math.round((part / total) * 100)}%`;
}
