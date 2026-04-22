'use client';
import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { notificationsEnabled, setNotificationsEnabled, requestPermission } from '@/lib/admin/realtime/notify';

export function NotificationToggle() {
  const [on, setOn] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('Notification' in window)) {
      setUnsupported(true);
      return;
    }
    setOn(notificationsEnabled());
  }, []);

  async function toggle() {
    if (!on) {
      const perm = await requestPermission();
      if (perm !== 'granted') return;
      setNotificationsEnabled(true);
      setOn(true);
    } else {
      setNotificationsEnabled(false);
      setOn(false);
    }
  }

  if (unsupported) return null;

  return (
    <button
      onClick={toggle}
      className="admin-btn"
      title={on ? 'Отключить уведомления' : 'Включить уведомления'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
    >
      {on ? <Bell size={12} /> : <BellOff size={12} />}
      {on ? 'Уведомления' : 'Включить'}
    </button>
  );
}
