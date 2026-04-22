import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface UtmSpendRow {
  id: string;
  bucket_date: string;
  utm_source: string;
  utm_medium: string | null;
  utm_campaign: string | null;
  amount_kzt: number;
  note: string | null;
}

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const sp = req.nextUrl.searchParams;
  const from = sp.get('from');
  const to = sp.get('to');
  const sb = createAdminClient();
  let q = sb
    .from('utm_spend')
    .select('id, bucket_date, utm_source, utm_medium, utm_campaign, amount_kzt, note')
    .order('bucket_date', { ascending: false });
  if (from) q = q.gte('bucket_date', from);
  if (to) q = q.lte('bucket_date', to);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: (data ?? []) as UtmSpendRow[] });
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = await req.json().catch(() => null) as {
    bucket_date?: string;
    utm_source?: string;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    amount_kzt?: number;
    note?: string | null;
  } | null;
  if (
    !body?.bucket_date ||
    !body.utm_source ||
    typeof body.amount_kzt !== 'number' ||
    body.amount_kzt < 0
  ) {
    return NextResponse.json(
      { error: 'bucket_date, utm_source, amount_kzt (>=0) are required' },
      { status: 400 },
    );
  }
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('utm_spend')
    .upsert(
      {
        bucket_date: body.bucket_date,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium ?? null,
        utm_campaign: body.utm_campaign ?? null,
        amount_kzt: body.amount_kzt,
        note: body.note ?? null,
      },
      { onConflict: 'bucket_date,utm_source,utm_medium,utm_campaign' },
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ row: data });
}

export async function DELETE(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const sp = req.nextUrl.searchParams;
  const id = sp.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const sb = createAdminClient();
  const { error } = await sb.from('utm_spend').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
