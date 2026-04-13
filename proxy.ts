import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'admin_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow login page and login API
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  const expectedPass = process.env.ADMIN_PASSWORD ?? '';
  if (!expectedPass) {
    // No password configured — allow access (dev mode)
    return NextResponse.next();
  }

  // Check cookie-based session (login form)
  const session = request.cookies.get(ADMIN_COOKIE)?.value;
  if (session === expectedPass) {
    return NextResponse.next();
  }

  // Check Basic Auth (API/programmatic access)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Basic ')) {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
    const colonIndex = decoded.indexOf(':');
    if (colonIndex !== -1) {
      const user = decoded.slice(0, colonIndex);
      const pass = decoded.slice(colonIndex + 1);
      const expectedUser = process.env.ADMIN_USERNAME ?? 'admin';
      if (user === expectedUser && pass === expectedPass) {
        return NextResponse.next();
      }
    }
  }

  // Redirect to login page for browser requests
  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('text/html')) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 401 for API requests
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Sales Up Admin"' },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};
