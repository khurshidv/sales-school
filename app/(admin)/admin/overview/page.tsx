import { Suspense } from 'react';
import OverviewClient from './OverviewClient';

export const revalidate = 60;
export const metadata = { title: 'Overview — Sales School' };

export default function OverviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <OverviewClient />
    </Suspense>
  );
}
