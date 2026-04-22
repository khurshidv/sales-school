import type { Metadata } from 'next';
import Sidebar from '@/components/admin/Sidebar';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin — Sales School',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root">
      <Sidebar />
      <div className="admin-main">
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
