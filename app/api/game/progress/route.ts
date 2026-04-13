import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/game/progress?playerId=...&scenarioId=...
 * Returns the latest non-completed session for the given player+scenario,
 * or null if none exists. Used to restore session after page refresh.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('playerId');
  const scenarioId = searchParams.get('scenarioId');

  if (!playerId || !scenarioId) {
    return NextResponse.json({ error: 'Missing playerId or scenarioId' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('game_progress')
    .select('day_id, session_state, is_completed, updated_at')
    .eq('player_id', playerId)
    .eq('scenario_id', scenarioId)
    .eq('is_completed', false)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ progress: null });
  }

  return NextResponse.json({
    progress: {
      dayId: data.day_id,
      sessionState: data.session_state,
      updatedAt: data.updated_at,
    },
  });
}

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

/**
 * DELETE /api/game/progress
 * Body: { playerId, scenarioId }
 * Removes all non-completed progress for the given player+scenario.
 * Used when starting a new game after completing all days.
 */
export async function DELETE(request: Request) {
  const { playerId, scenarioId } = await request.json();

  if (!playerId || !scenarioId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('game_progress')
    .delete()
    .eq('player_id', playerId)
    .eq('scenario_id', scenarioId)
    .eq('is_completed', false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
