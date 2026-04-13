'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/game/store/playerStore';
import { getStoredPhone, clearStoredPhone, setStoredPhone } from '@/lib/game/phoneStorage';
import { getDeviceId } from '@/lib/game/deviceId';

/**
 * Hydrates the player store from Supabase on mount.
 *
 * Lookup order:
 * 1. Phone from localStorage → fetch by phone
 * 2. Device fingerprint (IndexedDB/cookie) → fetch by deviceId
 *    (handles Instagram WebView clearing localStorage)
 *
 * If player found by device but not by phone (phone was cleared),
 * we re-store the phone locally for next time.
 *
 * Pass `ready = false` to defer hydration (e.g. while a ?reset=1 flow
 * is still wiping the player on the server).
 */
export function usePlayerInit(ready: boolean = true) {
  const setLoading = usePlayerStore((s) => s.setLoading);
  const setInitialized = usePlayerStore((s) => s.setInitialized);
  const loadPlayer = usePlayerStore((s) => s.loadPlayer);
  const reset = usePlayerStore((s) => s.reset);
  const isInitialized = usePlayerStore((s) => s.isInitialized);
  const didRun = useRef(false);

  useEffect(() => {
    if (!ready || didRun.current || isInitialized) return;
    didRun.current = true;

    async function init() {
      setLoading(true);

      const phone = getStoredPhone();

      // Strategy 1: lookup by phone (fast, reliable when localStorage survives)
      if (phone) {
        try {
          const res = await fetch(`/api/game/players?phone=${encodeURIComponent(phone)}`);
          const data = await res.json();

          if (data.player) {
            loadPlayer(data.player);
            setInitialized();
            return;
          }
          // Player deleted from Supabase
          clearStoredPhone();
        } catch (err) {
          console.warn('[usePlayerInit] Phone lookup failed:', err);
        }
      }

      // Strategy 2: lookup by device fingerprint
      // (Instagram WebView may have cleared localStorage but IndexedDB/cookie survived)
      try {
        const deviceId = await getDeviceId();
        const res = await fetch(`/api/game/players?deviceId=${encodeURIComponent(deviceId)}`);
        const data = await res.json();

        if (data.player) {
          // Re-store phone locally so next load is faster
          if (data.player.phone) {
            setStoredPhone(data.player.phone);
          }
          loadPlayer(data.player);
          setInitialized();
          return;
        }
      } catch (err) {
        console.warn('[usePlayerInit] Device lookup failed:', err);
      }

      // No player found — will show onboarding
      reset();
      setInitialized();
    }

    init();
  }, [ready, isInitialized, setLoading, setInitialized, loadPlayer, reset]);
}
