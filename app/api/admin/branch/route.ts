import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getBranchFlow, getNodeStats, getDropoffZones } from '@/lib/admin/queries-v2';
import { periodToRange } from '@/lib/admin/period';
import type { Period } from '@/lib/admin/types-v2';

export const dynamic = 'force-dynamic';

const VALID_PERIODS: Period[] = ['7d', '30d', '90d', 'all'];

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const sp = req.nextUrl.searchParams;
  const scenarioId = sp.get('scenarioId');
  const dayId = sp.get('dayId');
  const period = (sp.get('period') ?? '30d') as Period;
  if (!scenarioId || !dayId) {
    return NextResponse.json({ error: 'scenarioId and dayId required' }, { status: 400 });
  }
  if (!VALID_PERIODS.includes(period)) {
    return NextResponse.json({ error: 'invalid period' }, { status: 400 });
  }
  const range = periodToRange(period);

  const [flows, stats, dropoffs] = await Promise.all([
    getBranchFlow({ scenarioId, dayId, ...range }),
    getNodeStats({ scenarioId, dayId, ...range }),
    getDropoffZones({ scenarioId, ...range }),
  ]);

  return NextResponse.json({ flows, stats, dropoffs });
}
