import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client using the SERVICE ROLE key.
 * BYPASSES Row Level Security — NEVER import this into client components.
 * Only use inside server actions that have already verified the caller is an admin.
 * Required for managing auth users (create/delete) via the Auth Admin API.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
        "Add it to .env.local (Supabase Dashboard → Settings → API → service_role key)."
    );
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
