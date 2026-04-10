'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import SoundManager from '@/lib/game/audio/SoundManager';
import type { GameEventBus } from '@/game/engine/EventBus';

const ALL_SFX = [
  'sfx_choice_select', 'sfx_correct', 'sfx_wrong',
  'sfx_timer_tick', 'sfx_timer_expire',
  'sfx_life_lost', 'sfx_life_gained',
  'sfx_achievement', 'sfx_combo',
  'sfx_day_complete', 'sfx_day_fail', 'sfx_grandmaster',
] as const;

const ALL_BGM = ['bgm_showroom', 'bgm_tension', 'bgm_summary'] as const;

export function useAudio(eventBus: GameEventBus) {
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const unlockedRef = useRef(false);
  const pendingBgmRef = useRef<string | null>(null);

  // Initialize mute state
  useEffect(() => {
    setIsMuted(SoundManager.getInstance().isMuted());
  }, []);

  // Unlock AudioContext on first user interaction + preload
  useEffect(() => {
    const handleInteraction = async () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;

      const sm = SoundManager.getInstance();
      await sm.unlock();

      // If a BGM was requested before unlock, load *that specific track*
      // first and play it ASAP — don't make the player wait for every SFX
      // to finish fetching. Prior behaviour awaited Promise.all over all
      // sounds, causing a multi-second audio delay on first entry.
      const pending = pendingBgmRef.current;
      if (pending) {
        pendingBgmRef.current = null;
        sm.preload(pending).then(() => sm.playBgMusic(pending));
      }

      // Then warm the rest of the cache in the background.
      Promise.all([
        ...ALL_SFX.map((id) => sm.preload(id)),
        ...ALL_BGM.map((id) => sm.preload(id)),
      ]).then(() => setIsReady(true));

      document.removeEventListener('click', handleInteraction, true);
      document.removeEventListener('touchstart', handleInteraction, true);
    };

    // Use capture phase so audio unlocks BEFORE any other handler consumes the gesture
    document.addEventListener('click', handleInteraction, true);
    document.addEventListener('touchstart', handleInteraction, true);

    return () => {
      document.removeEventListener('click', handleInteraction, true);
      document.removeEventListener('touchstart', handleInteraction, true);
    };
  }, []);

  // Subscribe to EventBus sound_requested events
  useEffect(() => {
    const handler = (event: { type: 'sound_requested'; soundId: string }) => {
      SoundManager.getInstance().play(event.soundId);
    };
    eventBus.on('sound_requested', handler);
    return () => eventBus.off('sound_requested', handler);
  }, [eventBus]);

  const playSound = useCallback((soundId: string) => {
    SoundManager.getInstance().play(soundId);
  }, []);

  const playBgMusic = useCallback(async (soundId: string) => {
    // If not unlocked yet, store as pending — will play once preload completes
    if (!unlockedRef.current) {
      pendingBgmRef.current = soundId;
      return;
    }
    const sm = SoundManager.getInstance();
    // Ensure buffer is loaded before play. Idempotent — no-op if already
    // cached. Prevents the "play was called but buffer not decoded yet"
    // silent-failure path inside SoundManager.playBgMusic().
    await sm.preload(soundId);
    sm.playBgMusic(soundId);
  }, []);

  const stopBgMusic = useCallback(() => {
    pendingBgmRef.current = null;
    SoundManager.getInstance().stopBgMusic();
  }, []);

  const toggleMute = useCallback(() => {
    const sm = SoundManager.getInstance();
    const newMuted = !sm.isMuted();
    sm.setMuted(newMuted);
    setIsMuted(newMuted);
  }, []);

  return { playSound, playBgMusic, stopBgMusic, toggleMute, isMuted, isReady };
}
