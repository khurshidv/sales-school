// Central source of truth for all game event_type strings.
// Mirrored in supabase/migrations/008_admin_aggregates.sql — keep in sync.
export const GameEventType = {
  // Legacy (already logged by current game)
  GAME_STARTED: 'game_started',
  DAY_STARTED: 'day_started',
  DAY_COMPLETED: 'day_completed',
  DAY_FAILED: 'day_failed',
  CHOICE_MADE: 'choice_made',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  GAME_COMPLETED: 'game_completed',
  DROPPED_OFF: 'dropped_off',

  // Phase 1 — dashboard 2.0
  NODE_ENTERED: 'node_entered',
  NODE_EXITED: 'node_exited',
  BACK_NAVIGATION: 'back_navigation',
  DIALOGUE_REREAD: 'dialogue_reread',
  HEARTBEAT: 'heartbeat',
  IDLE_DETECTED: 'idle_detected',
  OFFER_VIEW: 'offer_view',
  OFFER_CTA_CLICK: 'offer_cta_click',
  OFFER_CONVERSION: 'offer_conversion',
} as const;

export type GameEventTypeValue = typeof GameEventType[keyof typeof GameEventType];

export const ALL_GAME_EVENT_TYPES: GameEventTypeValue[] = Object.values(GameEventType);
