// Phone-only localStorage — used to identify returning players.
// All actual data lives in Supabase (source of truth).

const PHONE_KEY = 'sales-school-phone';
const LEGACY_KEY = 'sales-school-player';

export function getStoredPhone(): string | null {
  if (typeof window === 'undefined') return null;

  // Migration: if old persist key exists, extract phone and migrate
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy);
      const phone = parsed?.state?.player?.phone as string | undefined;
      if (phone) {
        localStorage.setItem(PHONE_KEY, phone);
      }
      localStorage.removeItem(LEGACY_KEY);
      return phone ?? null;
    } catch {
      localStorage.removeItem(LEGACY_KEY);
    }
  }

  return localStorage.getItem(PHONE_KEY);
}

export function setStoredPhone(phone: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PHONE_KEY, phone);
}

export function clearStoredPhone(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PHONE_KEY);
  localStorage.removeItem(LEGACY_KEY);
}
