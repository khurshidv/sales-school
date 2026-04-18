'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Radio, LayoutDashboard, GitBranch, Sparkles, AlertTriangle,
  TrendingUp, Globe, Target, Users, User, Trophy, Menu, Mail,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  Icon: typeof Radio;
  live?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    label: 'Мониторинг',
    items: [
      { href: '/admin/realtime', label: 'Real-time', Icon: Radio, live: true },
      { href: '/admin/overview', label: 'Overview', Icon: LayoutDashboard },
    ],
  },
  {
    label: 'Игра',
    items: [
      { href: '/admin/branch', label: 'Branch Analytics', Icon: GitBranch },
      { href: '/admin/engagement', label: 'Engagement', Icon: Sparkles },
      { href: '/admin/dropoff', label: 'Drop-off Zones', Icon: AlertTriangle },
    ],
  },
  {
    label: 'Маркетинг',
    items: [
      { href: '/admin/funnel', label: 'Funnel & UTM', Icon: TrendingUp },
      { href: '/admin/leads', label: 'Заявки (формы)', Icon: Mail },
      { href: '/admin/pages', label: 'Pages', Icon: Globe },
      { href: '/admin/offer', label: 'Offer Conversion', Icon: Target },
    ],
  },
  {
    label: 'Игроки',
    items: [
      { href: '/admin/participants', label: 'Participants', Icon: Users },
      { href: '/admin/player', label: 'Player Journey', Icon: User },
      { href: '/admin/leaderboard', label: 'Leaderboard', Icon: Trophy },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="admin-burger"
        onClick={() => setOpen(!open)}
        aria-label="Меню"
      >
        <Menu size={20} />
      </button>
      <div
        className={`admin-overlay${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-mark" aria-hidden />
          <div className="admin-sidebar-brand-text">Sales School</div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {GROUPS.map((group) => (
            <div key={group.label}>
              <div className="admin-sidebar-group-label">{group.label}</div>
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-nav-link${active ? ' admin-nav-link--active' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    <item.Icon size={16} strokeWidth={2} />
                    <span>{item.label}</span>
                    {item.live && active && (
                      <span className="admin-nav-live-dot" aria-label="live" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          Sales School · © 2026
        </div>
      </aside>
    </>
  );
}
