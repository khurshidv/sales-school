import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/authGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface Annotation {
  scroll_depth: number;
  label: string;
  tone?: 'offer' | 'cta' | 'info';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { slug } = await params;
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('pages_registry')
    .select('annotations')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ annotations: ((data?.annotations ?? []) as Annotation[]) });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { slug } = await params;
  const body = await req.json().catch(() => null) as { annotations?: Annotation[] } | null;
  if (!body?.annotations || !Array.isArray(body.annotations)) {
    return NextResponse.json({ error: 'annotations[] required' }, { status: 400 });
  }
  for (const a of body.annotations) {
    if (typeof a.scroll_depth !== 'number' || a.scroll_depth < 0 || a.scroll_depth > 100) {
      return NextResponse.json({ error: 'scroll_depth must be 0..100' }, { status: 400 });
    }
    if (typeof a.label !== 'string' || a.label.trim().length === 0) {
      return NextResponse.json({ error: 'label required' }, { status: 400 });
    }
    if (a.tone !== undefined && !['offer', 'cta', 'info'].includes(a.tone)) {
      return NextResponse.json({ error: 'invalid tone' }, { status: 400 });
    }
  }
  const sb = createAdminClient();
  const { error } = await sb.from('pages_registry').update({ annotations: body.annotations }).eq('slug', slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
