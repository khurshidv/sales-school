import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { resolveNodeLabel } from '@/lib/admin/nodeLabels';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const url = new URL(req.url);
  const scenarioId = url.searchParams.get('scenario');
  const ids = url.searchParams.get('ids')?.split(',').filter(Boolean) ?? [];

  if (!scenarioId) {
    return NextResponse.json({ error: 'scenario required' }, { status: 400 });
  }

  const result = Object.fromEntries(ids.map(id => [id, resolveNodeLabel(scenarioId, id)]));
  return NextResponse.json({ labels: result });
}
