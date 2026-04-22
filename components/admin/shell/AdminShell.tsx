'use client';

import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { TopBar } from './TopBar';
import { GlobalSearch, useGlobalSearchHotkey } from './GlobalSearch';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  useGlobalSearchHotkey(() => setSearchOpen(true));

  return (
    <div className="admin-root">
      <Sidebar />
      <div className="admin-main">
        <TopBar onOpenSearch={() => setSearchOpen(true)} />
        <div className="admin-content">{children}</div>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
