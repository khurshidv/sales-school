import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const { playerId, scenarioId, dayId, sessionState, isCompleted } = await request.json();

  if (!playerId || !scenarioId || !dayId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('game_progress')
    .upsert(
      {
        player_id: playerId,
        scenario_id: scenarioId,
        day_id: dayId,
        session_state: sessionState || {},
        is_completed: isCompleted || false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'player_id,scenario_id,day_id' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
