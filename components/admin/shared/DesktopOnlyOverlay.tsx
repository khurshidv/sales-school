import { Monitor } from 'lucide-react';

export function DesktopOnlyOverlay({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="admin-desktop-only">{children}</div>
      <div
        className="admin-mobile-only"
        style={{
          padding: 24,
          textAlign: 'center',
          background: 'var(--admin-bg-2)',
          borderRadius: 12,
          color: 'var(--admin-text-muted)',
        }}
      >
        <Monitor size={32} style={{ marginBottom: 12, color: 'var(--admin-text-dim)' }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--admin-text)', marginBottom: 6 }}>
          Карта сценария доступна на десктопе
        </div>
        <div style={{ fontSize: 12 }}>
          Откройте дашборд на большом экране — граф сценария не оптимизирован для телефона.
        </div>
      </div>
    </>
  );
}
