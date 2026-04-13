import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/game/players?phone=+XXXXXXXXXXX
// Returns full player state from Supabase (source of truth)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone || !phone.startsWith('+') || phone.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('phone', phone)
    .single();

  if (!player) {
    return NextResponse.json({ player: null });
  }

  // Fetch achievements
  const { data: achievements } = await supabase
    .from('player_achievements')
    .select('achievement_id')
    .eq('player_id', player.id);

  // Fetch completed scenarios
  const { data: completed } = await supabase
    .from('completed_scenarios')
    .select('scenario_id, day_id, score, rating, time_taken, choices')
    .eq('player_id', player.id)
    .order('created_at', { ascending: true });

  return NextResponse.json({
    player: {
      id: player.id,
      phone: player.phone,
      displayName: player.display_name,
      avatarId: player.avatar_id,
      level: player.level ?? 1,
      totalXp: player.total_xp ?? 0,
      totalScore: player.total_score ?? 0,
      coins: player.coins ?? 0,
      achievements: (achievements ?? []).map((a: { achievement_id: string }) => a.achievement_id),
      completedScenarios: (completed ?? []).map((c: { scenario_id: string; day_id: string; score: number; rating: string; time_taken: number }) => ({
        scenarioId: c.scenario_id,
        dayIndex: parseInt(c.day_id?.replace(/\D/g, '') || '0', 10),
        score: c.score,
        rating: c.rating,
        timeTaken: c.time_taken,
        isReplay: false,
        completedAt: Date.now(),
      })),
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { phone, displayName, avatarId, utmSource, utmMedium, utmCampaign, referrer } = body;

  if (!phone || !phone.startsWith('+') || phone.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Try to find existing player by phone
  const { data: existing } = await supabase
    .from('players')
    .select('*')
    .eq('phone', phone)
    .single();

  if (existing) {
    return NextResponse.json({ player: existing });
  }

  // Create new player
  const { data: newPlayer, error } = await supabase
    .from('players')
    .insert({
      phone,
      display_name: displayName,
      avatar_id: avatarId || 'male',
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      referrer: referrer || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ player: newPlayer });
}

// DELETE /api/game/players?phone=+XXXXXXXXXXX
// Removes the player and cascades to progress, achievements, leaderboard, events.
// Used by the ?reset=1 URL trigger on the game hub.
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone || !phone.startsWith('+') || phone.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from('players').delete().eq('phone', phone);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
