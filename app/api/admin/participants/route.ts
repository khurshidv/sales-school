import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getPlayersEnriched } from '@/lib/admin/queries-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const search = sp.get('search') || undefined;
  const ratingFilter = sp.get('ratingFilter') || null;
  const limitRaw = sp.get('limit');
  const limit = limitRaw ? Math.min(Math.max(1, Number(limitRaw)), 10_000) : 100;

  const result = await getPlayersEnriched({ search, ratingFilter, limit });
  return NextResponse.json(result);
}
