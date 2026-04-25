import { Suspense } from 'react';
import LessonsClient from './LessonsClient';

export const revalidate = 60;
export const metadata = { title: 'Lessons funnel — Sales School' };

export default function LessonsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <LessonsClient />
    </Suspense>
  );
}
