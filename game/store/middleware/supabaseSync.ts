// Async sync functions — call after Zustand store updates
// Non-blocking: errors are logged but don't break the game

export async function syncCreatePlayer(
  phone: string,
  displayName: string,
  avatarId: 'male' | 'female',
  utm?: { source?: string; medium?: string; campaign?: string; referrer?: string },
): Promise<string | null> {
  // Returns server-side player ID or null on error
  try {
    const res = await fetch('/api/game/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        displayName,
        avatarId,
        utmSource: utm?.source,
        utmMedium: utm?.medium,
        utmCampaign: utm?.campaign,
        referrer: utm?.referrer,
      }),
    });
    const data = await res.json();
    if (data.player?.id) return data.player.id;
    console.warn('[sync] createPlayer failed:', data.error);
    return null;
  } catch (e) {
    console.warn('[sync] createPlayer error:', e);
    return null;
  }
}

export function syncDayResults(
  playerId: string,
  scenarioId: string,
  dayId: string,
  score: number,
  rating: string,
  timeTaken: number,
  choices: object[],
): void {
  // Fire-and-forget — never crashes the game
  try {
    fetch('/api/game/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, scenarioId, dayId, score, rating, timeTaken, choices }),
    }).catch((e) => console.warn('[sync] dayResults error:', e));
  } catch (e) {
    console.warn('[sync] dayResults error:', e);
  }
}

export function syncProgress(
  playerId: string,
  scenarioId: string,
  dayId: string,
  sessionState: object,
  isCompleted: boolean,
): void {
  // Fire-and-forget — never crashes the game
  try {
    fetch('/api/game/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, scenarioId, dayId, sessionState, isCompleted }),
    }).catch((e) => console.warn('[sync] progress error:', e));
  } catch (e) {
    console.warn('[sync] progress error:', e);
  }
}

export function syncAchievement(playerId: string, achievementId: string): void {
  // Fire-and-forget — never crashes the game
  try {
    fetch('/api/game/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, achievementId }),
    }).catch((e) => console.warn('[sync] achievement error:', e));
  } catch (e) {
    console.warn('[sync] achievement error:', e);
  }
}
