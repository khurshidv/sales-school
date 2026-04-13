/**
 * Page analytics — batched, fire-and-forget.
 *
 * Modeled after lib/game/analytics.ts. Events queue in memory and flush:
 *   - 2 seconds after the first queued event (debounced)
 *   - on tab hide (visibilitychange=hidden)
 *   - on page unload (pagehide, for iOS Safari)
 * The "page_leave" event flushes immediately because the page is closing.
 */

import { createClient } from '@/lib/supabase/client';

export interface PageEvent {
  visitor_id: string;
  session_id: string;
  page_slug: string;
  event_type: string;
  event_data: Record<string, unknown>;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referrer?: string | null;
  device_type?: string | null;
  browser?: string | null;
  screen_width?: number | null;
  screen_height?: number | null;
}

const VISITOR_KEY = 'ss_vid';
const SESSION_KEY = 'ss_sid';

let queue: PageEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let listenersAttached = false;

const FLUSH_DEBOUNCE_MS = 2000;

function generateId(): string {
  return crypto.randomUUID();
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateId();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function attachFlushListeners(): void {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;

  const onHidden = () => {
    if (document.visibilityState === 'hidden') flush();
  };
  document.addEventListener('visibilitychange', onHidden);
  window.addEventListener('pagehide', flush);
}

function flush(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;

  const batch = queue;
  queue = [];

  try {
    const supabase = createClient();
    supabase
      .from('page_events')
      .insert(batch)
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) console.warn('[page-analytics] batch flush', error.message);
      });
  } catch (e) {
    console.warn('[page-analytics] failed to flush:', e);
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, FLUSH_DEBOUNCE_MS);
}

export function trackPageEvent(event: PageEvent): void {
  try {
    queue.push(event);
    attachFlushListeners();

    if (event.event_type === 'page_leave') {
      flush();
    } else {
      scheduleFlush();
    }
  } catch (e) {
    console.warn('[page-analytics] failed to track:', event.event_type, e);
  }
}
