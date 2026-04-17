const KEY = 'ss_game_sid';

export function getOrCreateGameSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}
