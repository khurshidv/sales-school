import { Suspense } from 'react';
import ParticipantsClient from './ParticipantsClient';

export const revalidate = 60;
export const metadata = { title: 'Participants — Sales School' };

export default function ParticipantsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <ParticipantsClient />
    </Suspense>
  );
}
