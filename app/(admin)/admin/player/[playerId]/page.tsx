import { Suspense } from 'react';
import PlayerClient from './PlayerClient';

export const revalidate = 30;
export const metadata = { title: 'Player Journey — Sales School' };

interface Props {
  params: Promise<{ playerId: string }>;
}

export default async function PlayerJourneyPage({ params }: Props) {
  const { playerId } = await params;
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--admin-text-dim)' }}>Загружаем…</div>}>
      <PlayerClient playerId={playerId} />
    </Suspense>
  );
}
