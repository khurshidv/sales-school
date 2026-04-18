import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { requireAdmin } from '../authGuard';

describe('requireAdmin', () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'secret';
  });

  afterEach(() => {
    delete process.env.ADMIN_PASSWORD;
  });

  it('returns 500 when ADMIN_PASSWORD is not configured', () => {
    delete process.env.ADMIN_PASSWORD;
    const req = new NextRequest('http://localhost/api/admin/overview');
    const res = requireAdmin(req);
    expect(res?.status).toBe(500);
  });

  it('returns 401 when cookie is missing', () => {
    const req = new NextRequest('http://localhost/api/admin/overview');
    const res = requireAdmin(req);
    expect(res?.status).toBe(401);
  });

  it('returns 401 when cookie value does not match ADMIN_PASSWORD', () => {
    const req = new NextRequest('http://localhost/api/admin/overview', {
      headers: { cookie: 'admin_session=wrong' },
    });
    const res = requireAdmin(req);
    expect(res?.status).toBe(401);
  });

  it('returns null when cookie matches', () => {
    const req = new NextRequest('http://localhost/api/admin/overview', {
      headers: { cookie: 'admin_session=secret' },
    });
    const res = requireAdmin(req);
    expect(res).toBeNull();
  });
});
