'use client';

// ============================================================
// Onboarding Stealth Preloader
//
// During onboarding (5 steps, 30-60s of user interaction),
// the user only needs ~100KB of assets. Meanwhile we silently
// preload Day 1's critical and early-game assets in the
// background, so when the player starts the game, everything
// is already cached.
//
// Budget: 30s on 3G @ 1.5Mbps = ~5.6MB — more than enough.
// ============================================================

import { useEffect, useRef } from 'react';
import { getScenario } from '@/game/data/scenarios';
import { getCriticalAssets, buildPreloadQueue } from '@/lib/game/assetGraph';

const rIC =
  typeof requestIdleCallback !== 'undefined'
    ? requestIdleCallback
    : (cb: IdleRequestCallback) =>
        setTimeout(
          () => cb({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline),
          1,
        );

const cIC =
  typeof cancelIdleCallback !== 'undefined'
    ? cancelIdleCallback
    : clearTimeout;

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

/**
 * Starts stealth preloading of Day 1 assets when onboarding step >= threshold.
 *
 * @param step Current onboarding step (0-indexed)
 * @param startAtStep Step at which to begin preloading (default: 1)
 * @param scenarioId Scenario to preload (default: 'car-dealership')
 */
export function useOnboardingPreloader(
  step: number,
  startAtStep = 1,
  scenarioId = 'car-dealership',
): void {
  const startedRef = useRef(false);
  const idleRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (step < startAtStep || startedRef.current) return;
    startedRef.current = true;

    const scenario = getScenario(scenarioId);
    if (!scenario || scenario.days.length === 0) return;

    const day = scenario.days[0];
    const loaded = new Set<string>();

    // 1. Critical assets first (day_intro bg + first dialogue)
    const critical = getCriticalAssets(day, scenarioId);

    // 2. Then the broader preload queue (depth 8 from root)
    const queue = buildPreloadQueue(day, day.rootNodeId, scenarioId, 8, new Set());

    // Merge: critical first, then queue (deduplicated)
    const allUrls: string[] = [...critical];
    const seen = new Set(critical);
    for (const entry of queue) {
      if (!seen.has(entry.url)) {
        seen.add(entry.url);
        allUrls.push(entry.url);
      }
    }

    let idx = 0;

    const loadNext = () => {
      if (idx >= allUrls.length) return;

      const url = allUrls[idx]!;
      idx++;

      if (loaded.has(url)) {
        // Skip already loaded, schedule next
        idleRef.current = rIC(loadNext);
        return;
      }

      preloadImage(url).then(() => {
        loaded.add(url);
        // Schedule next load in idle time
        idleRef.current = rIC(loadNext);
      });
    };

    // Start loading
    idleRef.current = rIC(loadNext);

    return () => {
      if (idleRef.current !== null) {
        cIC(idleRef.current as number);
      }
    };
  }, [step, startAtStep, scenarioId]);
}
