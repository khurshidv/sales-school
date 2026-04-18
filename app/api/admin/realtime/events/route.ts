import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getRecentGameEvents } from '@/lib/admin/queries-v2';

export const dynamic = 'force-dynamic';

// NOTE: `getRecentGameEvents(minutes)` queries events from the last N minutes
// (not a row limit). We accept `minutes` as the query param and clamp 1..1440.
export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const minutesRaw = req.nextUrl.searchParams.get('minutes');
  const minutes = minutesRaw ? Math.min(Math.max(1, Number(minutesRaw)), 1440) : 60;
  const events = await getRecentGameEvents(minutes);
  return NextResponse.json({ events });
}
