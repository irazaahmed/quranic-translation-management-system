import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "editor" | "viewer";

export interface AuthProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
}

/**
 * Returns the current logged-in user's profile (with role), or null if
 * not logged in. Safe to call from Server Components / Server Actions.
 */
export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Auth user exists but no profile row yet — treat as viewer.
    return { id: user.id, email: user.email ?? null, full_name: null, role: "viewer" };
  }

  return profile as AuthProfile;
}

/** True if the role can create/edit/delete data. */
export function canWrite(role: Role | null | undefined): boolean {
  return role === "admin" || role === "editor";
}

/** True if the role can manage users. */
export function isAdmin(role: Role | null | undefined): boolean {
  return role === "admin";
}

/**
 * Guard for server actions that modify data.
 * Throws if the caller is not a logged-in admin/editor.
 * Returns the profile on success.
 */
export async function requireStaff(): Promise<AuthProfile> {
  const profile = await getCurrentProfile();
  if (!profile || !canWrite(profile.role)) {
    throw new Error("UNAUTHORIZED");
  }
  return profile;
}

/**
 * Guard for admin-only server actions (user management).
 * Throws if the caller is not a logged-in admin.
 */
export async function requireAdmin(): Promise<AuthProfile> {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile.role)) {
    throw new Error("UNAUTHORIZED");
  }
  return profile;
}
