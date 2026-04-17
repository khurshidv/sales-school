import { createClient } from '@/lib/supabase/client';

/**
 * Analytics — batched, fire-and-forget.
 *
 * Previously: each trackEvent() hit Supabase INSERT immediately, which on a
 * single playthrough fired 6+ HTTPS requests with full TLS handshake cost
 * on mobile. Now events go into a module-level queue and are flushed:
 *   - 2 seconds after the first queued event (debounced)
 *   - on tab hide (visibilitychange=hidden)
 *   - on page unload (pagehide, for iOS Safari which skips beforeunload)
 * The "dropped_off" event flushes immediately because it fires from a
 * beforeunload handler and the debounce timer may never run.
 */

interface QueuedEvent {
  player_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  scenario_id: string | null;
  day_id: string | null;
}

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let listenersAttached = false;

// Expose synchronous flush for tests (noop in production; ref-equals flush).
if (typeof globalThis !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__flushAnalyticsQueue = () => flush();
}

const FLUSH_DEBOUNCE_MS = 2000;

function attachFlushListeners(): void {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;

  const onHidden = () => {
    if (document.visibilityState === 'hidden') flush();
  };
  document.addEventListener('visibilitychange', onHidden);
  // iOS Safari: beforeunload is unreliable, pagehide fires on bfcache put.
  window.addEventListener('pagehide', flush);
}

function flush(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;

  // Snapshot & reset queue so any concurrent trackEvent calls don't
  // resurrect already-sent events.
  const batch = queue;
  queue = [];

  try {
    const supabase = createClient();
    supabase
      .from('game_events')
      .insert(batch)
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) console.warn('[analytics] batch flush', error.message);
      });
  } catch (e) {
    console.warn('[analytics] failed to flush:', e);
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, FLUSH_DEBOUNCE_MS);
}

export function trackEvent(
  playerId: string,
  eventType: string,
  eventData?: Record<string, unknown>,
  scenarioId?: string,
  dayId?: string,
): void {
  try {
    queue.push({
      player_id: playerId,
      event_type: eventType,
      event_data: eventData ?? {},
      scenario_id: scenarioId ?? null,
      day_id: dayId ?? null,
    });
    attachFlushListeners();

    // Critical drop-off event: flush immediately because we're on the way
    // out of the page and the debounce timer may never fire.
    if (eventType === 'dropped_off') {
      flush();
    } else {
      scheduleFlush();
    }
  } catch (e) {
    console.warn('[analytics] failed to track:', eventType, e);
  }
}

import { GameEventType } from './eventTypes';

// -----------------------------------------------------------------------------
// Typed helpers — dashboard 2.0
// Each helper wraps trackEvent() with a fixed event_type and shaped event_data.
// Keeps call sites clean and prevents typos in event_type strings.
// -----------------------------------------------------------------------------

export function trackNodeEntered(
  playerId: string,
  scenarioId: string,
  dayId: string,
  nodeId: string,
): void {
  trackEvent(playerId, GameEventType.NODE_ENTERED, { node_id: nodeId }, scenarioId, dayId);
}

export function trackNodeExited(
  playerId: string,
  scenarioId: string,
  dayId: string,
  nodeId: string,
  timeSpentMs: number,
): void {
  trackEvent(
    playerId,
    GameEventType.NODE_EXITED,
    { node_id: nodeId, time_spent_ms: timeSpentMs },
    scenarioId,
    dayId,
  );
}

export function trackBackNavigation(
  playerId: string,
  scenarioId: string,
  dayId: string,
  fromNodeId: string,
  toNodeId: string,
): void {
  trackEvent(
    playerId,
    GameEventType.BACK_NAVIGATION,
    { from_node_id: fromNodeId, to_node_id: toNodeId },
    scenarioId,
    dayId,
  );
}

export function trackDialogueReread(
  playerId: string,
  scenarioId: string,
  dayId: string,
  nodeId: string,
  rereadCount: number,
): void {
  trackEvent(
    playerId,
    GameEventType.DIALOGUE_REREAD,
    { node_id: nodeId, reread_count: rereadCount },
    scenarioId,
    dayId,
  );
}

export function trackHeartbeat(
  playerId: string,
  scenarioId: string,
  dayId: string,
  sessionId: string,
  nodeId: string | null,
): void {
  trackEvent(
    playerId,
    GameEventType.HEARTBEAT,
    { session_id: sessionId, node_id: nodeId },
    scenarioId,
    dayId,
  );
}

export function trackIdleDetected(
  playerId: string,
  scenarioId: string,
  dayId: string,
  sessionId: string,
  idleMs: number,
): void {
  trackEvent(
    playerId,
    GameEventType.IDLE_DETECTED,
    { session_id: sessionId, idle_ms: idleMs },
    scenarioId,
    dayId,
  );
}

export function trackChoiceMadeWithTiming(
  playerId: string,
  scenarioId: string,
  dayId: string,
  nodeId: string,
  choiceIndex: number,
  choiceId: string,
  thinkingTimeMs: number,
): void {
  trackEvent(
    playerId,
    GameEventType.CHOICE_MADE,
    {
      node_id: nodeId,
      choice_index: choiceIndex,
      choice_id: choiceId,
      thinking_time_ms: thinkingTimeMs,
    },
    scenarioId,
    dayId,
  );
}

// Test-only: flush queue synchronously. Not called in production paths.
export function flushAnalyticsForTest(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__flushAnalyticsQueue?.();
}
