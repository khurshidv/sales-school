import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getDropoffZones } from '@/lib/admin/queries-v2';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all'];

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const scenarioId = sp.get('scenarioId');
  if (!scenarioId) return NextResponse.json({ error: 'scenarioId required' }, { status: 400 });
  const period = (sp.get('period') ?? '30d') as Period;
  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json({ error: 'invalid period' }, { status: 400 });
  }
  const range = periodToRange(period);

  const dropoffs = await getDropoffZones({ scenarioId, ...range });
  return NextResponse.json({ dropoffs });
}
