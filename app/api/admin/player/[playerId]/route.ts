import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getPlayerSummary, getPlayerJourneyData, getCompletedDaysForPlayer } from '@/lib/admin/queries-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ playerId: string }> }) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const { playerId } = await params;
  if (!playerId) return NextResponse.json({ error: 'playerId required' }, { status: 400 });

  const [summary, journey, completedDays] = await Promise.all([
    getPlayerSummary(playerId),
    getPlayerJourneyData(playerId),
    getCompletedDaysForPlayer(playerId),
  ]);

  return NextResponse.json({ summary, journey, completedDays });
}
