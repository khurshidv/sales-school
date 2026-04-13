/**
 * Lightweight device detection from userAgent — no external deps.
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function detectDeviceType(): DeviceType {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/iPad|Android(?!.*Mobile)|tablet/i.test(ua)) return 'tablet';
  if (/Mobile|iPhone|iPod|Android.*Mobile|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  return 'other';
}

export function detectOS(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux') && !ua.includes('Android')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  return 'other';
}
