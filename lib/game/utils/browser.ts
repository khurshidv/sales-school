/**
 * Detect in-app browsers (Instagram, Telegram, Facebook, TikTok, etc.)
 * These browsers don't support Fullscreen API.
 */
export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Telegram|TelegramBot|Twitter|Line\/|MicroMessenger|Snapchat|Pinterest|LinkedIn/i.test(ua);
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function canRequestFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.documentElement;
  return !!(el.requestFullscreen || (el as any).webkitRequestFullscreen);
}
