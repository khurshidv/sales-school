import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimit, _resetRateLimitForTest } from '../rateLimit';

describe('rateLimit', () => {
  beforeEach(() => {
    _resetRateLimitForTest();
    vi.useRealTimers();
  });

  it('allows up to limit requests', () => {
    const key = 'ip:1';
    for (let i = 0; i < 5; i += 1) {
      expect(rateLimit(key, { limit: 5, windowMs: 1000 }).allowed).toBe(true);
    }
  });

  it('blocks after limit exceeded', () => {
    const key = 'ip:2';
    for (let i = 0; i < 5; i += 1) rateLimit(key, { limit: 5, windowMs: 1000 });
    const result = rateLimit(key, { limit: 5, windowMs: 1000 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after window expires', () => {
    vi.useFakeTimers();
    const key = 'ip:3';
    const now = 1_700_000_000_000;
    vi.setSystemTime(now);
    for (let i = 0; i < 5; i += 1) rateLimit(key, { limit: 5, windowMs: 1000 });
    expect(rateLimit(key, { limit: 5, windowMs: 1000 }).allowed).toBe(false);
    vi.setSystemTime(now + 1001);
    expect(rateLimit(key, { limit: 5, windowMs: 1000 }).allowed).toBe(true);
  });

  it('isolates by key', () => {
    for (let i = 0; i < 5; i += 1) rateLimit('ip:a', { limit: 5, windowMs: 1000 });
    expect(rateLimit('ip:a', { limit: 5, windowMs: 1000 }).allowed).toBe(false);
    expect(rateLimit('ip:b', { limit: 5, windowMs: 1000 }).allowed).toBe(true);
  });
});
