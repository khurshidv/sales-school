import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'admin_session';

function unauthorized(request: NextRequest, pathname: string) {
  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('text/html')) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  const expectedPass = process.env.ADMIN_PASSWORD ?? '';

  // Fail CLOSED: missing password = admin disabled (previously was fail-open).
  if (!expectedPass) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[proxy] ADMIN_PASSWORD not set — admin disabled');
    }
    return unauthorized(request, pathname);
  }

  const session = request.cookies.get(ADMIN_COOKIE)?.value;
  if (session === expectedPass) {
    return NextResponse.next();
  }

  return unauthorized(request, pathname);
}

export const config = {
  matcher: ['/admin/:path*'],
};
