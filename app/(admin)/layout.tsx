import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin — Sales School',
};

const navItems = [
  { href: '/admin/overview', label: 'Overview' },
  { href: '/admin/pages', label: 'Страницы' },
  { href: '/admin/participants', label: 'Participants' },
  { href: '/admin/game-metrics', label: 'Game Metrics' },
  { href: '/admin/leaderboard', label: 'Leaderboard' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          body { margin: 0; font-family: system-ui, sans-serif; background: #f4f5f7; }
          .admin-nav-link {
            display: block;
            padding: 10px 20px;
            color: #d1d5db;
            text-decoration: none;
            font-size: 14px;
            transition: background 0.15s, color 0.15s;
          }
          .admin-nav-link:hover {
            background: #2a2d35;
            color: #fff;
          }
        `}</style>
      </head>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar */}
          <aside
            style={{
              width: 220,
              background: '#1a1d23',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: '24px 20px 16px',
                borderBottom: '1px solid #2a2d35',
              }}
            >
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Sales School
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Admin Panel</div>
            </div>
            <nav style={{ padding: '12px 0', flex: 1 }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="admin-nav-link"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #2a2d35', fontSize: 12, color: '#4b5563' }}>
              Sales School © 2026
            </div>
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
