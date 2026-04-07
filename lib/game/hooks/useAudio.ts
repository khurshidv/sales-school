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
  const unlockedRef = useRef(false);
  const preloadedRef = useRef(false);

  // Initialize mute state
  useEffect(() => {
    const sm = SoundManager.getInstance();
    setIsMuted(sm.isMuted());
  }, []);

  // Unlock AudioContext on first user interaction
  useEffect(() => {
    const handleInteraction = async () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;

      const sm = SoundManager.getInstance();
      await sm.unlock();

      // Preload all sounds after unlock
      if (!preloadedRef.current) {
        preloadedRef.current = true;
        await Promise.all([
          ...ALL_SFX.map((id) => sm.preload(id)),
          ...ALL_BGM.map((id) => sm.preload(id)),
        ]);
      }

      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction, { once: false });
    document.addEventListener('touchstart', handleInteraction, { once: false });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
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

  const playBgMusic = useCallback((soundId: string) => {
    SoundManager.getInstance().playBgMusic(soundId);
  }, []);

  const stopBgMusic = useCallback(() => {
    SoundManager.getInstance().stopBgMusic();
  }, []);

  const toggleMute = useCallback(() => {
    const sm = SoundManager.getInstance();
    const newMuted = !sm.isMuted();
    sm.setMuted(newMuted);
    setIsMuted(newMuted);
  }, []);

  return { playSound, playBgMusic, stopBgMusic, toggleMute, isMuted };
}
