import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { getDealById } from '@/lib/bitrix/deals';
import { stageLabel } from '@/lib/bitrix/stages';

export const dynamic = 'force-dynamic';

function buildBitrixDealUrl(id: number): string | null {
  const base = process.env.BITRIX_PORTAL_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/crm/deal/details/${id}/`;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await ctx.params;
  const dealId = Number(id);
  if (!Number.isFinite(dealId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }
  const deal = await getDealById(dealId);
  if (!deal) return NextResponse.json({ deal: null });
  return NextResponse.json({
    deal,
    stage: stageLabel(deal.STAGE_ID),
    portalUrl: buildBitrixDealUrl(dealId),
  });
}
