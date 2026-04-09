// Async sync functions — call after Zustand store updates
// Critical syncs use retry; progress saves remain fire-and-forget

async function syncWithRetry(
  fn: () => Promise<Response>,
  label: string,
  maxRetries = 3,
): Promise<Response | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fn();
      if (res.ok) return res;
      console.warn(`[sync] ${label} attempt ${attempt + 1} failed: ${res.status}`);
    } catch (e) {
      console.warn(`[sync] ${label} attempt ${attempt + 1} error:`, e);
    }
    if (attempt < maxRetries - 1) {
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  console.warn(`[sync] ${label} all ${maxRetries} attempts failed`);
  return null;
}

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

export async function syncDayResults(
  playerId: string,
  scenarioId: string,
  dayId: string,
  score: number,
  rating: string,
  timeTaken: number,
  choices: object[],
): Promise<void> {
  await syncWithRetry(
    () =>
      fetch('/api/game/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, scenarioId, dayId, score, rating, timeTaken, choices }),
      }),
    'dayResults',
  );
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

export async function syncAchievement(playerId: string, achievementId: string): Promise<void> {
  await syncWithRetry(
    () =>
      fetch('/api/game/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, achievementId }),
      }),
    'achievement',
  );
}
