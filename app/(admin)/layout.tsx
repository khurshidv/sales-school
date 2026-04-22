import type { Metadata } from 'next';
import { ToastProvider } from '@/components/admin/shared/ToastProvider';
import { AdminShell } from '@/components/admin/shell/AdminShell';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin — Sales School',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
