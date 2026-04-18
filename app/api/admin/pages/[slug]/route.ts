import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getPageAnalytics } from '@/lib/admin/page-queries';

// Note: the /admin/pages/[slug] page is a server component that calls
// getPageAnalytics directly, so it doesn't need this route today. Kept here
// for future client-side use (drill-down UIs, etc.).
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const { slug } = await params;
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  const sp = req.nextUrl.searchParams;
  const fromRaw = sp.get('from');
  const toRaw = sp.get('to');
  const from = fromRaw ? new Date(fromRaw) : new Date(Date.now() - 30 * 86_400_000);
  const to = toRaw ? new Date(toRaw) : new Date();
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json({ error: 'invalid from/to' }, { status: 400 });
  }

  const data = await getPageAnalytics(slug, from, to);
  return NextResponse.json(data);
}
