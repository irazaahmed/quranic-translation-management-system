import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (for use in Client Components).
 * Uses the public anon key and reads/writes the auth session from cookies.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
