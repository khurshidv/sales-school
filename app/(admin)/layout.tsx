import type { Metadata } from 'next';
import Sidebar from '@/components/admin/Sidebar';
import { ToastProvider } from '@/components/admin/shared/ToastProvider';
import { TopBar } from '@/components/admin/shell/TopBar';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin — Sales School',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="admin-root">
        <Sidebar />
        <div className="admin-main">
          <TopBar />
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
