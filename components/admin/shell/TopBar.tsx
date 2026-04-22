'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, Search } from 'lucide-react';
import { useToast } from '../shared/ToastProvider';

interface Props {
  onOpenSearch?: () => void;
}

export function TopBar({ onOpenSearch }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (!res.ok) throw new Error('logout failed');
      router.replace('/admin/login');
      router.refresh();
    } catch (e) {
      toast.push({ tone: 'danger', title: 'Не удалось выйти', description: String(e) });
      setBusy(false);
    }
  }

  return (
    <div className="admin-shell-topbar">
      <button
        type="button"
        className="admin-shell-search"
        onClick={onOpenSearch}
        aria-label="Поиск"
      >
        <Search size={14} />
        <span>Найти…</span>
        <kbd>⌘K</kbd>
      </button>
      <div className="admin-shell-actions">
        <button type="button" className="admin-icon-btn" aria-label="Уведомления">
          <Bell size={16} />
        </button>
        <button
          type="button"
          className="admin-icon-btn"
          aria-label="Выйти"
          disabled={busy}
          onClick={logout}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
