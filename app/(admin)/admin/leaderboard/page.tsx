import { Suspense } from 'react';
import LeaderboardClient from './LeaderboardClient';

export const revalidate = 300;
export const metadata = { title: 'Leaderboard — Sales School' };

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <LeaderboardClient />
    </Suspense>
  );
}
