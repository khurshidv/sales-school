import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getLeads } from '@/lib/admin/page-queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const limitRaw = sp.get('limit');
  const limit = limitRaw ? Math.min(Math.max(1, Number(limitRaw)), 500) : 25;
  const offsetRaw = sp.get('offset');
  const offset = offsetRaw ? Math.max(0, Number(offsetRaw)) : 0;

  const result = await getLeads({
    slug: sp.get('slug') ?? undefined,
    limit,
    offset,
    search: sp.get('search') ?? undefined,
    sortBy: sp.get('sortBy') ?? 'created_at',
    sortAsc: sp.get('sortAsc') === 'true',
    from: sp.get('from') ?? undefined,
    to: sp.get('to') ?? undefined,
  });
  return NextResponse.json(result);
}
