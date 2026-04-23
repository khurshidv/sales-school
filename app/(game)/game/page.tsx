'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePlayerStore } from '@/game/store/playerStore';
import { useLang } from '@/lib/game/utils/lang';
import { syncCreatePlayer } from '@/game/store/middleware/supabaseSync';
import { setStoredPhone, getStoredPhone, clearStoredPhone } from '@/lib/game/phoneStorage';
import { usePlayerInit } from '@/lib/game/hooks/usePlayerInit';
import { getDeviceId } from '@/lib/game/deviceId';
import { trackEvent } from '@/lib/game/analytics';
import OnboardingSequence from '@/components/game/screens/OnboardingSequence';
import ScenarioSelect from '@/components/game/screens/ScenarioSelect';
import RotateDevice from '@/components/game/screens/RotateDevice';
import type { Language } from '@/game/engine/types';

function GameHubLoading() {
  return (
    <>
      <RotateDevice />
      <div className="flex h-full w-full items-center justify-center bg-[#0a0a1a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
      </div>
    </>
  );
}

// Next.js 16 requires useSearchParams() to be inside a <Suspense> boundary
// during static prerendering — otherwise the build fails with
// "missing-suspense-with-csr-bailout".
export default function GameHub() {
  return (
    <Suspense fallback={<GameHubLoading />}>
      <GameHubInner />
    </Suspense>
  );
}

function GameHubInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const player = usePlayerStore((s) => s.player);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const isInitialized = usePlayerStore((s) => s.isInitialized);
  const loadPlayer = usePlayerStore((s) => s.loadPlayer);
  const setInitialized = usePlayerStore((s) => s.setInitialized);
  const resetPlayer = usePlayerStore((s) => s.reset);
  const { lang, setLang } = useLang();

  // Check for active (in-progress) session in Supabase
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // 24h re-onboarding: if player's lastSeenAt > 24h, force onboarding
  // but remember the player so same phone restores progress
  const [forceReOnboarding, setForceReOnboarding] = useState(false);

  // Onboarding submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!player?.id) {
      setSessionChecked(true);
      return;
    }

    // Check 24h threshold
    if (player.lastSeenAt) {
      const hoursSinceLastSeen = (Date.now() - new Date(player.lastSeenAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSeen >= 24) {
        setForceReOnboarding(true);
      }
    }

    fetch(`/api/game/progress?playerId=${encodeURIComponent(player.id)}&scenarioId=car-dealership`)
      .then((r) => r.json())
      .then((data) => {
        setHasActiveSession(!!data.progress?.sessionState);
      })
      .catch(() => {})
      .finally(() => setSessionChecked(true));
  }, [player?.id, player?.lastSeenAt]);

  // ?reset=1 → wipe player from Supabase + clear phone + show onboarding.
  // Runs before usePlayerInit so hydration sees an empty localStorage.
  const [resetDone, setResetDone] = useState(() => searchParams.get('reset') !== '1');

  useEffect(() => {
    if (resetDone) return;
    let cancelled = false;
    (async () => {
      const phone = getStoredPhone();
      if (phone) {
        try {
          await fetch(`/api/game/players?phone=${encodeURIComponent(phone)}`, {
            method: 'DELETE',
          });
        } catch {
          // Network errors are non-fatal — we still clear local state below.
        }
      }
      clearStoredPhone();
      resetPlayer();
      if (cancelled) return;
      // Strip ?reset=1 from URL so refresh doesn't re-trigger.
      router.replace('/game');
      setResetDone(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [resetDone, resetPlayer, router]);

  // Hydrate player from Supabase on mount (waits for reset to finish).
  usePlayerInit(resetDone);

  const handleFormSubmit = async (name: string, phone: string, selectedLang: Language) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setLang(selectedLang);

    try {
      // Get device fingerprint to link this device to the player
      const deviceFingerprint = await getDeviceId();

      // Create player in Supabase first (source of truth)
      const serverId = await syncCreatePlayer(phone, name, deviceFingerprint, selectedLang);
      if (!serverId) {
        setSubmitError(selectedLang === 'uz'
          ? 'Serverga ulanib bo\'lmadi. Qaytadan urinib ko\'ring.'
          : 'Не удалось подключиться к серверу. Попробуйте ещё раз.');
        setIsSubmitting(false);
        return;
      }

      // Store phone locally for identification
      setStoredPhone(phone);

      // Fire-and-forget: create/keep a Bitrix deal at "Игра: прошёл онбординг" stage.
      // If the same phone replays, the route returns the existing deal without duplicating.
      fetch('/api/bitrix/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          sourcePage: 'game',
          gameStage: 'onboarding',
          landingUrl: typeof window !== 'undefined' ? window.location.href : null,
          referrer: typeof document !== 'undefined' ? document.referrer || null : null,
        }),
      }).catch(() => null);

      // Fetch full player from server to hydrate store
      try {
        const res = await fetch(`/api/game/players?phone=${encodeURIComponent(phone)}`);
        const data = await res.json();
        if (data.player) {
          loadPlayer(data.player);
          setForceReOnboarding(false);
          setInitialized();
          trackEvent(data.player.id, 'game_started');
        }
      } catch {
        // Fallback: load minimal player data
        loadPlayer({
          id: serverId,
          phone,
          displayName: name,
          avatarId: 'male',
          level: 1,
          totalXp: 0,
          totalScore: 0,
          coins: 0,
          achievements: [],
          completedScenarios: [],
        });
        setForceReOnboarding(false);
        setInitialized();
        trackEvent(serverId, 'game_started');
      }
    } catch {
      setSubmitError(selectedLang === 'uz'
        ? 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.'
        : 'Произошла ошибка. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectScenario = (scenarioId: string) => {
    router.push(`/game/play?scenario=${scenarioId}`);
  };

  // Show loading while hydrating from Supabase
  if (!isInitialized || isLoading || !sessionChecked) {
    return (
      <>
        <RotateDevice />
        <div className="flex h-full w-full items-center justify-center bg-[#0a0a1a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        </div>
      </>
    );
  }

  // Auto-redirect first-time players straight into Day 1 after onboarding.
  // Skipped when ?menu=1 is present — that's an explicit "Exit to menu" from
  // PauseMenu / FinalResults, where the player wants to see ScenarioSelect.
  const forceMenu = searchParams.get('menu') === '1';
  const hasCompletedScenario = player && player.completedScenarios.length > 0;

  // Don't auto-redirect if we're forcing re-onboarding (24h rule)
  if (player && !hasCompletedScenario && !forceMenu && !hasActiveSession && !forceReOnboarding) {
    router.replace('/game/play?scenario=car-dealership');
    return (
      <>
        <RotateDevice />
        <div className="flex h-full w-full items-center justify-center bg-[#0a0a1a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        </div>
      </>
    );
  }

  // Determine game state for the menu button
  const totalDays = 3;
  const completedDayCount = player
    ? new Set(player.completedScenarios.filter((r) => r.scenarioId === 'car-dealership').map((r) => r.dayIndex)).size
    : 0;
  const isGameFullyCompleted = completedDayCount >= totalDays;

  const handleNewGame = async () => {
    // Clear saved progress so game starts fresh from Day 1
    if (player?.id) {
      try {
        await fetch('/api/game/progress', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: player.id, scenarioId: 'car-dealership' }),
        });
      } catch {
        // Non-fatal — game will start fresh anyway
      }
    }
    router.push('/game/play?scenario=car-dealership');
  };

  return (
    <>
      <RotateDevice />
      {!player || forceReOnboarding ? (
        <OnboardingSequence onSubmit={handleFormSubmit} isSubmitting={isSubmitting} submitError={submitError} />
      ) : (
        <ScenarioSelect
          playerName={player.displayName}
          playerLevel={player.level}
          playerCoins={player.coins}
          onSelectScenario={handleSelectScenario}
          onNewGame={handleNewGame}
          hasActiveSession={hasActiveSession}
          isGameFullyCompleted={isGameFullyCompleted}
          lang={lang}
        />
      )}
    </>
  );
}
