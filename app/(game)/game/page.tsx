'use client';

import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/game/store/playerStore';
import { useLang } from '@/lib/game/utils/lang';
import { syncCreatePlayer } from '@/game/store/middleware/supabaseSync';
import { trackEvent } from '@/lib/game/analytics';
import PhoneForm from '@/components/game/screens/PhoneForm';
import ScenarioSelect from '@/components/game/screens/ScenarioSelect';
import RotateDevice from '@/components/game/screens/RotateDevice';
import type { Language } from '@/game/engine/types';

export default function GameHub() {
  const router = useRouter();
  const player = usePlayerStore((s) => s.player);
  const createPlayer = usePlayerStore((s) => s.createPlayer);
  const { lang, setLang } = useLang();

  const handleFormSubmit = async (name: string, phone: string, lang: Language, avatarId: 'male' | 'female') => {
    createPlayer(name, phone, avatarId);
    setLang(lang);

    // Sync to Supabase in background
    const serverId = await syncCreatePlayer(phone, name, avatarId);
    if (serverId) {
      // Update localStorage player with server ID
      const currentPlayer = usePlayerStore.getState().player;
      if (currentPlayer) {
        usePlayerStore.getState().loadPlayer({ ...currentPlayer, id: serverId });
        trackEvent(serverId, 'game_started');
      }
    }
  };

  const handleSelectScenario = (scenarioId: string) => {
    router.push(`/game/play?scenario=${scenarioId}`);
  };

  return (
    <>
      <RotateDevice />
      {!player ? (
        <PhoneForm onSubmit={handleFormSubmit} />
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
