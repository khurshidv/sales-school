'use client';

import { useLeaderboard } from '@/lib/game/hooks/useLeaderboard';
import { usePlayerStore } from '@/game/store/playerStore';

export default function LeaderboardPage() {
  const player = usePlayerStore((s) => s.player);
  const { entries, playerRank, isLoading } = useLeaderboard(player?.id);

  return (
    <div className="h-dvh bg-neutral-950 text-white p-6 overflow-y-auto">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Лидерборд</h1>
          <a href="/game" className="text-[#4a90d9] text-sm hover:underline">← Меню</a>
        </div>

        {playerRank && (
          <div className="bg-[#4a90d9]/10 border border-[#4a90d9]/20 rounded-lg p-3 mb-4 text-center">
            <span className="text-[#4a90d9] font-medium">
              Ты на {playerRank} месте из {entries.length}
            </span>
          </div>
        )}

        {isLoading ? (
          <p className="text-neutral-500 text-center py-12">Загрузка...</p>
        ) : entries.length === 0 ? (
          <p className="text-neutral-500 text-center py-12">
            Пока никто не играл. Будь первым!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry, i) => {
              const isMe = entry.player_id === player?.id;
              return (
                <div
                  key={entry.player_id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isMe ? 'bg-[#4a90d9]/15 border border-[#4a90d9]/30' : 'bg-white/5'
                  }`}
                >
                  <span className={`text-lg font-bold w-8 text-center ${
                    i === 0 ? 'text-[#ffd700]' : i === 1 ? 'text-neutral-300' : i === 2 ? 'text-amber-600' : 'text-neutral-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#4a90d9] flex items-center justify-center text-xs font-bold">
                    {entry.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.display_name}</p>
                    <p className="text-xs text-neutral-500">Lv.{entry.level}</p>
                  </div>
                  <span className="text-[#ffd700] font-bold">★ {entry.total_score}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
