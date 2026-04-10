import { createBrowserClient } from "@supabase/ssr";

// Module-level cache: the browser client is safe to reuse across the whole
// app (one WebSocket, one REST client). Previously analytics.ts and
// useLeaderboard each called createClient() per trackEvent / per hook
// instantiation, creating 6+ short-lived clients per gameplay session.
let cached: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  cached = createBrowserClient(url, key);
  return cached;
}
