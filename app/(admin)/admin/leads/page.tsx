import { Suspense } from 'react';
import LeadsClient from './LeadsClient';

export const revalidate = 60;
export const metadata = { title: 'Leads — Sales School' };

export default function LeadsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <LeadsClient />
    </Suspense>
  );
}
