// lib/admin/thresholds.ts
// Central config for all admin magic-numbers / threshold constants.
// Isomorphic — no server-only, no React imports. Safe for both client and server.

export const THRESHOLDS = {
  heartbeat: {
    liveWindowSeconds: 90,
  },
  engagement: {
    thinkTimeMinSeconds: 5,
    thinkTimeMaxSeconds: 15,
    slowNodeMs: 15_000,
    replayHealthyMin: 0.10,
    replayHealthyMax: 0.30,
  },
  dropoff: {
    minVisitsForRate: 20,
    shortExitSeconds: 5,
    insightRateMin: 0.20,
  },
  offer: {
    lowCtrThreshold: 0.05,
    minViewsForStat: 50, // intentionally raised from 10 (audit item #15)
  },
  overview: {
    lowCompletionRate: 0.10,
  },
  leaderboard: {
    podiumSize: 3,
    topLimit: 50,
  },
} as const;

export type Thresholds = typeof THRESHOLDS;
