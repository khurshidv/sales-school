'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface LeaderboardEntry {
  player_id: string;
  display_name: string;
  avatar_id: string;
  level: number;
  total_score: number;
  scenarios_completed: number;
}

interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  playerRank: number | null;
  isLoading: boolean;
}

export function useLeaderboard(currentPlayerId?: string): UseLeaderboardReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(50);

      if (!error && data) {
        setEntries(data);
      }
      setIsLoading(false);
    };

    fetchLeaderboard();

    // Realtime subscription
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboard' },
        () => {
          // Refetch on any change
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const playerRank = currentPlayerId
    ? entries.findIndex((e) => e.player_id === currentPlayerId) + 1 || null
    : null;

  return { entries, playerRank, isLoading };
}
