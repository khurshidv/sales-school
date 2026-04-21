import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/admin/rateLimit';

function getIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const rl = rateLimit(`admin:login:${ip}`, { limit: 8, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in a minute.' },
      {
        status: 429,
        headers: { 'retry-after': String(Math.ceil(rl.resetInMs / 1000)) },
      },
    );
  }

  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', adminPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
