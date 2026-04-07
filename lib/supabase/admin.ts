import { createClient } from '@supabase/supabase-js';

// Server-side admin client with service role key
// Only use in API routes — never expose to browser
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
