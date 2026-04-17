'use client';

import type { ReactNode } from 'react';

export interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <div className="admin-topbar">
      <div>
        <div className="admin-topbar-title">{title}</div>
        {subtitle && <div className="admin-topbar-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="admin-topbar-actions">{actions}</div>}
    </div>
  );
}
