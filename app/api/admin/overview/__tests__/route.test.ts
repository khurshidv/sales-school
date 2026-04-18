import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/admin/queries-v2', () => ({
  getDailyTrends: vi.fn().mockResolvedValue([]),
  getUtmFunnel: vi.fn().mockResolvedValue([]),
  getOfferFunnelData: vi.fn().mockResolvedValue({ game_completed: 0, offer_view: 0, offer_cta_click: 0, offer_conversion: 0 }),
}));

import { GET } from '../route';

describe('GET /api/admin/overview', () => {
  beforeEach(() => { process.env.ADMIN_PASSWORD = 'secret'; });
  afterEach(() => { delete process.env.ADMIN_PASSWORD; });

  it('401 without cookie', async () => {
    const req = new NextRequest('http://localhost/api/admin/overview?period=30d');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('400 for invalid period', async () => {
    const req = new NextRequest('http://localhost/api/admin/overview?period=bogus', {
      headers: { cookie: 'admin_session=secret' },
    });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('200 with trends, utm, offer on valid request', async () => {
    const req = new NextRequest('http://localhost/api/admin/overview?period=30d', {
      headers: { cookie: 'admin_session=secret' },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('trends');
    expect(body).toHaveProperty('utm');
    expect(body).toHaveProperty('offer');
  });
});
