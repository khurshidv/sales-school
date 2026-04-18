import { Suspense } from 'react';
import RealtimeClient from './RealtimeClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Real-time — Sales School' };

export default function RealtimePage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <RealtimeClient />
    </Suspense>
  );
}
