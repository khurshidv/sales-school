'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/game/store/playerStore';
import { getStoredPhone, clearStoredPhone } from '@/lib/game/phoneStorage';

/**
 * Hydrates the player store from Supabase on mount.
 * Reads phone from localStorage → fetches player from server.
 * If player was deleted from Supabase, clears phone and triggers onboarding.
 */
export function usePlayerInit() {
  const setLoading = usePlayerStore((s) => s.setLoading);
  const setInitialized = usePlayerStore((s) => s.setInitialized);
  const loadPlayer = usePlayerStore((s) => s.loadPlayer);
  const reset = usePlayerStore((s) => s.reset);
  const isInitialized = usePlayerStore((s) => s.isInitialized);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current || isInitialized) return;
    didRun.current = true;

    async function init() {
      setLoading(true);

      const phone = getStoredPhone();
      if (!phone) {
        setInitialized();
        return;
      }

      try {
        const res = await fetch(`/api/game/players?phone=${encodeURIComponent(phone)}`);
        const data = await res.json();

        if (data.player) {
          loadPlayer(data.player);
          setInitialized();
        } else {
          // Player deleted from Supabase
          clearStoredPhone();
          reset();
          setInitialized();
        }
      } catch (err) {
        console.warn('[usePlayerInit] Network error, retrying in 2s...', err);
        // Retry once after 2s on network error
        setTimeout(async () => {
          try {
            const res = await fetch(`/api/game/players?phone=${encodeURIComponent(phone)}`);
            const data = await res.json();
            if (data.player) {
              loadPlayer(data.player);
            } else {
              clearStoredPhone();
              reset();
            }
          } catch {
            // Give up — keep loading state so user sees spinner, not broken onboarding
            console.warn('[usePlayerInit] Retry failed, showing loading state');
          }
          setInitialized();
        }, 2000);
      }
    }

    init();
  }, [isInitialized, setLoading, setInitialized, loadPlayer, reset]);
}
