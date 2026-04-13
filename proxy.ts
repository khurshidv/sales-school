import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Basic ')) {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
    const colonIndex = decoded.indexOf(':');
    if (colonIndex !== -1) {
      const user = decoded.slice(0, colonIndex);
      const pass = decoded.slice(colonIndex + 1);
      const expectedUser = process.env.ADMIN_USERNAME ?? 'admin';
      const expectedPass = process.env.ADMIN_PASSWORD ?? '';
      if (user === expectedUser && pass === expectedPass && expectedPass !== '') {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Sales Up Admin"' },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};
