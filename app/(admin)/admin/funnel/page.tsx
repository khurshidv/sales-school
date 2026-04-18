import { Suspense } from 'react';
import FunnelClient from './FunnelClient';

export const revalidate = 60;
export const metadata = { title: 'Funnel & UTM — Sales School' };

export default function FunnelPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <FunnelClient />
    </Suspense>
  );
}
