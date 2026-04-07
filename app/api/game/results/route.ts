import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const { playerId, scenarioId, dayId, score, rating, timeTaken, choices } = await request.json();

  if (!playerId || !scenarioId || !dayId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 1. Insert completed scenario
  const { error: insertError } = await supabase
    .from('completed_scenarios')
    .insert({
      player_id: playerId,
      scenario_id: scenarioId,
      day_id: dayId,
      score: score || 0,
      rating: rating || 'C',
      time_taken: timeTaken || 0,
      choices: choices || [],
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 2. Update player totals
  // Use RPC or raw update — increment total_score
  const { error: updateError } = await supabase.rpc('increment_player_score', {
    p_player_id: playerId,
    p_score: score || 0,
  });

  // If RPC doesn't exist, fallback to manual update
  if (updateError) {
    // Fetch current, add, update
    const { data: player } = await supabase
      .from('players')
      .select('total_score')
      .eq('id', playerId)
      .single();

    if (player) {
      await supabase
        .from('players')
        .update({ total_score: (player.total_score || 0) + (score || 0) })
        .eq('id', playerId);
    }
  }

  // 3. Upsert leaderboard
  const { data: playerData } = await supabase
    .from('players')
    .select('display_name, avatar_id, level, total_score')
    .eq('id', playerId)
    .single();

  if (playerData) {
    // Count completed scenarios
    const { count } = await supabase
      .from('completed_scenarios')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', playerId);

    await supabase
      .from('leaderboard')
      .upsert({
        player_id: playerId,
        display_name: playerData.display_name,
        avatar_id: playerData.avatar_id,
        level: playerData.level,
        total_score: playerData.total_score,
        scenarios_completed: count || 0,
      }, { onConflict: 'player_id' });
  }

  return NextResponse.json({ success: true });
}
