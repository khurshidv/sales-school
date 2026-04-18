import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getLeaderboardEnriched } from '@/lib/admin/queries-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const limitRaw = req.nextUrl.searchParams.get('limit');
  const limit = limitRaw ? Math.min(Math.max(1, Number(limitRaw)), 1000) : 100;
  const items = await getLeaderboardEnriched(limit);
  return NextResponse.json({ items });
}
