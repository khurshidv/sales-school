'use client';

import type { FunnelIdentity } from './types';

const LS_LEAD_KEY = 'salesup.funnel.lead_id';
const LS_TOKEN_KEY = 'salesup.funnel.token';

export function readIdentity(): FunnelIdentity | null {
  if (typeof window === 'undefined') return null;
  try {
    const leadId = window.localStorage.getItem(LS_LEAD_KEY);
    const token = window.localStorage.getItem(LS_TOKEN_KEY);
    if (!leadId || !token) return null;
    return { leadId, token };
  } catch {
    return null;
  }
}

export function writeIdentity(id: FunnelIdentity): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_LEAD_KEY, id.leadId);
    window.localStorage.setItem(LS_TOKEN_KEY, id.token);
  } catch {
    /* noop */
  }
}

export function clearIdentity(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LS_LEAD_KEY);
    window.localStorage.removeItem(LS_TOKEN_KEY);
  } catch {
    /* noop */
  }
}

export async function postFunnelEvent(
  eventType: string,
  extra: { leadId?: string; token?: string; lessonIndex?: number; meta?: Record<string, unknown> } = {},
): Promise<void> {
  try {
    await fetch('/api/funnel/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        lead_id: extra.leadId,
        token: extra.token,
        lesson_index: extra.lessonIndex,
        meta: extra.meta,
      }),
      keepalive: true,
    });
  } catch {
    /* silent */
  }
}
