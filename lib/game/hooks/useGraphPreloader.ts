'use client';

// ============================================================
// Graph-Aware Predictive Asset Preloader
//
// Replaces the old useAssetPreloader which loaded ALL day assets
// via Promise.all() before gameplay could begin (30-40s on 3G).
//
// This preloader:
// 1. Lets gameplay start after only the critical-path assets load
//    (~350KB, 2-3s on 3G)
// 2. Runs BFS on the scenario DAG to preload assets by priority
// 3. Uses requestIdleCallback to never block the main thread
// 4. Re-prioritises on every node change, cancels unreachable loads
// 5. Adapts preload window to connection speed
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Day } from '@/game/engine/types';
import { buildPreloadQueue, getCriticalAssets } from '@/lib/game/assetGraph';
import {
  getConnectionTier,
  getPreloadDepth,
  onConnectionChange,
  type ConnectionTier,
} from '@/lib/game/network';

// --- Image cache (shared across hook instances within same page) ---

const imageCache = new Map<string, HTMLImageElement>();
const loadedUrls = new Set<string>();
const inflightAbortControllers = new Map<string, AbortController>();

function preloadImage(url: string): { promise: Promise<void>; abort: () => void } {
  if (loadedUrls.has(url)) {
    return { promise: Promise.resolve(), abort: () => {} };
  }

  // If already in flight, return a promise that resolves when it completes
  if (inflightAbortControllers.has(url)) {
    return {
      promise: new Promise<void>((resolve) => {
        const img = imageCache.get(url);
        if (img?.complete) { resolve(); return; }
        // Poll briefly — image is already loading
        const check = setInterval(() => {
          if (loadedUrls.has(url) || !inflightAbortControllers.has(url)) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      }),
      abort: () => {},
    };
  }

  const ac = new AbortController();
  inflightAbortControllers.set(url, ac);

  const img = new Image();
  imageCache.set(url, img);

  const promise = new Promise<void>((resolve) => {
    const cleanup = () => {
      inflightAbortControllers.delete(url);
    };

    img.onload = () => {
      loadedUrls.add(url);
      cleanup();
      resolve();
    };
    img.onerror = () => {
      cleanup();
      resolve(); // Silent fail — asset may not exist
    };

    ac.signal.addEventListener('abort', () => {
      img.src = ''; // Cancel download
      imageCache.delete(url);
      cleanup();
      resolve();
    });

    img.src = url;
  });

  return {
    promise,
    abort: () => ac.abort(),
  };
}

// --- requestIdleCallback polyfill ---

const rIC =
  typeof requestIdleCallback !== 'undefined'
    ? requestIdleCallback
    : (cb: IdleRequestCallback) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline), 1);

const cIC =
  typeof cancelIdleCallback !== 'undefined'
    ? cancelIdleCallback
    : clearTimeout;

// --- Hook ---

export interface UseGraphPreloaderReturn {
  /** Load only critical-path assets for a day. Resolves fast (~350KB). */
  preloadCritical: (day: Day, scenarioId: string) => Promise<void>;
  /** Start continuous background preloading from a given node. */
  startPreloading: (day: Day, scenarioId: string, nodeId: string) => void;
  /** Update current node — re-prioritises the queue. */
  onNodeChange: (nodeId: string) => void;
  /** Stop all background preloading. */
  stop: () => void;
  /** Whether critical assets are loaded and gameplay can begin. */
  isReady: boolean;
  /** Check if a specific URL is already cached. */
  isLoaded: (url: string) => boolean;
}

export function useGraphPreloader(): UseGraphPreloaderReturn {
  const [isReady, setIsReady] = useState(false);
  const dayRef = useRef<Day | null>(null);
  const scenarioIdRef = useRef<string>('');
  const currentNodeIdRef = useRef<string>('');
  const idleHandleRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);
  const connectionRef = useRef<ConnectionTier>(
    typeof window !== 'undefined' ? getConnectionTier() : 'medium',
  );

  // Track connection changes
  useEffect(() => {
    return onConnectionChange((tier) => {
      connectionRef.current = tier;
    });
  }, []);

  const preloadCritical = useCallback(async (day: Day, scenarioId: string) => {
    setIsReady(false);
    dayRef.current = day;
    scenarioIdRef.current = scenarioId;

    const urls = getCriticalAssets(day, scenarioId);
    // Load critical assets in parallel (only 1-3 images)
    await Promise.all(urls.map((url) => preloadImage(url).promise));
    setIsReady(true);
  }, []);

  const processQueue = useCallback(() => {
    const day = dayRef.current;
    const scenarioId = scenarioIdRef.current;
    const nodeId = currentNodeIdRef.current;
    if (!day || !nodeId) return;

    const depth = getPreloadDepth(connectionRef.current);
    if (depth === 0) return; // offline — don't preload

    const queue = buildPreloadQueue(day, nodeId, scenarioId, depth, loadedUrls);

    let idx = 0;

    const loadNext = (deadline?: IdleDeadline) => {
      // Load assets while we have idle time (or at least 1 per tick)
      while (idx < queue.length) {
        const entry = queue[idx];
        idx++;

        if (loadedUrls.has(entry.url)) continue;

        preloadImage(entry.url);

        // If we've used most of our idle budget, yield
        if (deadline && deadline.timeRemaining() < 2) {
          idleHandleRef.current = rIC(loadNext);
          return;
        }
      }
    };

    idleHandleRef.current = rIC(loadNext);
  }, []);

  const startPreloading = useCallback(
    (day: Day, scenarioId: string, nodeId: string) => {
      dayRef.current = day;
      scenarioIdRef.current = scenarioId;
      currentNodeIdRef.current = nodeId;
      processQueue();
    },
    [processQueue],
  );

  const onNodeChange = useCallback(
    (nodeId: string) => {
      currentNodeIdRef.current = nodeId;

      // Cancel current idle processing and re-queue with new priorities
      if (idleHandleRef.current !== null) {
        cIC(idleHandleRef.current as number);
        idleHandleRef.current = null;
      }

      // Cancel in-flight loads for assets no longer reachable
      const day = dayRef.current;
      const scenarioId = scenarioIdRef.current;
      if (day) {
        const depth = getPreloadDepth(connectionRef.current);
        const newQueue = buildPreloadQueue(day, nodeId, scenarioId, depth, loadedUrls);
        const reachableUrls = new Set(newQueue.map((e) => e.url));

        for (const [url, ac] of inflightAbortControllers) {
          if (!reachableUrls.has(url)) {
            ac.abort();
          }
        }
      }

      processQueue();
    },
    [processQueue],
  );

  const stop = useCallback(() => {
    if (idleHandleRef.current !== null) {
      cIC(idleHandleRef.current as number);
      idleHandleRef.current = null;
    }
    // Cancel all in-flight loads
    for (const [, ac] of inflightAbortControllers) {
      ac.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (idleHandleRef.current !== null) {
        cIC(idleHandleRef.current as number);
      }
    };
  }, []);

  const isLoaded = useCallback((url: string) => loadedUrls.has(url), []);

  return {
    preloadCritical,
    startPreloading,
    onNodeChange,
    stop,
    isReady,
    isLoaded,
  };
}
