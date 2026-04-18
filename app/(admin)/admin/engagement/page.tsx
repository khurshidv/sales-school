import { Suspense } from 'react';
import EngagementClient from './EngagementClient';

export const revalidate = 60;
export const metadata = { title: 'Engagement — Sales School' };

export default function EngagementPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <EngagementClient />
    </Suspense>
  );
}
