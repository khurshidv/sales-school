import 'server-only';
import { NextRequest, NextResponse } from 'next/server';

export function requireAdmin(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: 'Admin auth not configured' }, { status: 500 });
  }
  const cookie = req.cookies.get('admin_session')?.value;
  if (!cookie || cookie !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
