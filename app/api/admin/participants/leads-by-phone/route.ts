import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const MAX_PHONES = 500;

interface PhoneInfo {
  count: number;
  bitrixDealId: number | null;
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }

  const phones = (body as { phones?: unknown })?.phones;
  if (!Array.isArray(phones)) return NextResponse.json({ error: 'phones must be an array' }, { status: 400 });

  const cleanPhones = phones
    .filter((p): p is string => typeof p === 'string' && p.length > 0)
    .slice(0, MAX_PHONES);

  if (cleanPhones.length === 0) return NextResponse.json({ leadsByPhone: {} });

  const admin = createAdminClient();
  const { data } = await admin
    .from('leads')
    .select('phone, bitrix_deal_id, created_at')
    .in('phone', cleanPhones)
    .order('created_at', { ascending: false });

  const map: Record<string, PhoneInfo> = {};
  for (const row of data ?? []) {
    const phone = row.phone as string;
    if (!map[phone]) {
      map[phone] = { count: 0, bitrixDealId: null };
    }
    map[phone].count += 1;
    // First (most recent) non-null deal_id wins
    if (map[phone].bitrixDealId === null && row.bitrix_deal_id != null) {
      map[phone].bitrixDealId = row.bitrix_deal_id as number;
    }
  }
  return NextResponse.json({ leadsByPhone: map });
}
