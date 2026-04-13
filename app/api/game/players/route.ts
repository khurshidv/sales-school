import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/game/players?phone=+XXXXXXXXXXX
// GET /api/game/players?deviceId=UUID — fallback lookup by device fingerprint
// Returns full player state from Supabase (source of truth)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');
  const deviceId = searchParams.get('deviceId');

  const supabase = createAdminClient();

  let player: Record<string, unknown> | null = null;

  if (phone && phone.startsWith('+') && phone.replace(/\D/g, '').length >= 8) {
    // Primary: lookup by phone
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('phone', phone)
      .single();
    player = data;
  } else if (deviceId) {
    // Fallback: lookup by device fingerprint (for when IG WebView cleared localStorage)
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('device_fingerprint', deviceId)
      .order('last_seen_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    player = data;
  } else {
    return NextResponse.json({ error: 'Provide phone or deviceId' }, { status: 400 });
  }

  if (player) {
    // Update last_seen_at for 24h re-onboarding tracking
    supabase
      .from('players')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', player.id)
      .then(() => {});
  }

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
      lastSeenAt: player.last_seen_at ?? player.created_at,
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
  const { phone, displayName, avatarId, deviceFingerprint, utmSource, utmMedium, utmCampaign, referrer } = body;

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
    // Update device fingerprint if provided (links this device to existing player)
    if (deviceFingerprint && existing.device_fingerprint !== deviceFingerprint) {
      supabase
        .from('players')
        .update({ device_fingerprint: deviceFingerprint, last_seen_at: new Date().toISOString() })
        .eq('id', existing.id)
        .then(() => {});
    }
    return NextResponse.json({ player: existing });
  }

  // Create new player
  const { data: newPlayer, error } = await supabase
    .from('players')
    .insert({
      phone,
      display_name: displayName,
      avatar_id: avatarId || 'male',
      device_fingerprint: deviceFingerprint || null,
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
