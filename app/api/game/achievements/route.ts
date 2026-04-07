import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const { playerId, achievementId } = await request.json();

  if (!playerId || !achievementId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Insert with ON CONFLICT DO NOTHING (via unique index)
  const { error } = await supabase
    .from('player_achievements')
    .upsert(
      {
        player_id: playerId,
        achievement_id: achievementId,
      },
      { onConflict: 'player_id,achievement_id', ignoreDuplicates: true }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
