'use client';

import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/game/store/playerStore';
import { useLang } from '@/lib/game/utils/lang';
import { syncCreatePlayer } from '@/game/store/middleware/supabaseSync';
import { setStoredPhone } from '@/lib/game/phoneStorage';
import { usePlayerInit } from '@/lib/game/hooks/usePlayerInit';
import { trackEvent } from '@/lib/game/analytics';
import OnboardingSequence from '@/components/game/screens/OnboardingSequence';
import ScenarioSelect from '@/components/game/screens/ScenarioSelect';
import RotateDevice from '@/components/game/screens/RotateDevice';
import type { Language } from '@/game/engine/types';

export default function GameHub() {
  const router = useRouter();
  const player = usePlayerStore((s) => s.player);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const isInitialized = usePlayerStore((s) => s.isInitialized);
  const loadPlayer = usePlayerStore((s) => s.loadPlayer);
  const setInitialized = usePlayerStore((s) => s.setInitialized);
  const { lang, setLang } = useLang();

  // Hydrate player from Supabase on mount
  usePlayerInit();

  const handleFormSubmit = async (name: string, phone: string, selectedLang: Language, avatarId: 'male' | 'female') => {
    setLang(selectedLang);

    // Create player in Supabase first (source of truth)
    const serverId = await syncCreatePlayer(phone, name, avatarId);
    if (serverId) {
      // Store phone locally for identification
      setStoredPhone(phone);

      // Fetch full player from server to hydrate store
      try {
        const res = await fetch(`/api/game/players?phone=${encodeURIComponent(phone)}`);
        const data = await res.json();
        if (data.player) {
          loadPlayer(data.player);
          setInitialized();
          trackEvent(data.player.id, 'game_started');
        }
      } catch {
        // Fallback: load minimal player data
        loadPlayer({
          id: serverId,
          phone,
          displayName: name,
          avatarId,
          level: 1,
          totalXp: 0,
          totalScore: 0,
          coins: 0,
          achievements: [],
          completedScenarios: [],
        });
        setInitialized();
        trackEvent(serverId, 'game_started');
      }
    }
  };

  const handleSelectScenario = (scenarioId: string) => {
    router.push(`/game/play?scenario=${scenarioId}`);
  };

  // Show loading while hydrating from Supabase
  if (!isInitialized || isLoading) {
    return (
      <>
        <RotateDevice />
        <div className="flex h-full w-full items-center justify-center bg-[#0a0a1a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        </div>
      </>
    );
  }

  // Auto-redirect to game if player exists and hasn't completed any scenario
  const hasCompletedScenario = player && player.completedScenarios.length > 0;

  if (player && !hasCompletedScenario) {
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

  return (
    <>
      <RotateDevice />
      {!player ? (
        <OnboardingSequence onSubmit={handleFormSubmit} />
      ) : (
        <ScenarioSelect
          playerName={player.displayName}
          playerLevel={player.level}
          playerCoins={player.coins}
          onSelectScenario={handleSelectScenario}
          lang={lang}
        />
      )}
    </>
  );
}
