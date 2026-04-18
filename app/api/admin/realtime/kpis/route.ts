import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getRealtimeKpis } from '@/lib/admin/queries-v2';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const kpis = await getRealtimeKpis();
  return NextResponse.json(kpis);
}
