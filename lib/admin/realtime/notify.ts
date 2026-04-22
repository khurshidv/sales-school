const KEY = 'admin.notifications.enabled';

export function notificationsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY) === '1';
}

export function setNotificationsEnabled(on: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, on ? '1' : '0');
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return await Notification.requestPermission();
}

export function notify(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/favicon.ico' });
  } catch {
    // silent — some browsers throw on constructor in non-secure contexts
  }
}
