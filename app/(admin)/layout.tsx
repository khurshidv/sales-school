import type { Metadata } from 'next';
import Sidebar from '@/components/admin/Sidebar';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin — Sales Up',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root">
      <Sidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
