import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json();
  const { phone, displayName, avatarId, utmSource, utmMedium, utmCampaign, referrer } = body;

  // Validate phone: must start with +998 and have 9 digits after
  const phoneDigits = phone.replace(/\D/g, '');
  if (!phoneDigits.startsWith('998') || phoneDigits.length !== 12) {
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
