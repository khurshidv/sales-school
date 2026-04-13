'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin/overview', label: 'Обзор', icon: 'dashboard' },
  { href: '/admin/pages', label: 'Страницы', icon: 'web' },
  { href: '/admin/leads', label: 'Заявки', icon: 'contact_mail' },
  { href: '/admin/participants', label: 'Участники', icon: 'group' },
  { href: '/admin/game-metrics', label: 'Метрики игры', icon: 'sports_esports' },
  { href: '/admin/leaderboard', label: 'Лидерборд', icon: 'leaderboard' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="admin-burger" onClick={() => setOpen(!open)} aria-label="Меню">
        <span className="material-symbols-outlined">menu</span>
      </button>
      <div className={`admin-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div className="admin-sidebar-header">
          <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Sales Up
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Admin Panel</div>
        </div>
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, marginRight: 10, verticalAlign: 'middle', opacity: isActive ? 1 : 0.6 }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #2a2d35', fontSize: 12, color: '#4b5563' }}>
          Sales Up © 2026
        </div>
      </aside>
    </>
  );
}
