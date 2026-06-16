"use server";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ManagedUser {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface UserActionState {
  error?: string;
  success?: string;
}

const VALID_ROLES: Role[] = ["admin", "editor", "viewer"];

/** List all users (admin only). */
export async function listUsers(): Promise<ManagedUser[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as ManagedUser[];
}

/** Create a new user with a role (admin only). */
export async function createUserAction(
  prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  try {
    await requireAdmin();

    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const fullName = (formData.get("full_name") as string)?.trim() || null;
    const role = formData.get("role") as Role;

    if (!email || !password) {
      return { error: "Email and password are required." };
    }
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }
    if (!VALID_ROLES.includes(role)) {
      return { error: "Invalid role selected." };
    }

    const admin = createAdminClient();

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (error) {
      return { error: error.message };
    }

    // Ensure the profile reflects the chosen role/name (in case the trigger
    // defaulted it). Upsert is safe and idempotent.
    if (data.user) {
      await admin.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
      });
    }

    revalidatePath("/admin/users");
    return { success: `User ${email} created as ${role}.` };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "You don't have permission to manage users." };
    }
    console.error("Failed to create user:", error);
    return { error: "Failed to create user. Please try again." };
  }
}

/** Change a user's role (admin only). Admins can't demote themselves. */
export async function updateUserRoleAction(
  userId: string,
  role: Role
): Promise<UserActionState> {
  try {
    const me = await requireAdmin();

    if (!VALID_ROLES.includes(role)) {
      return { error: "Invalid role." };
    }
    if (userId === me.id && role !== "admin") {
      return { error: "You can't remove your own admin access." };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    return { success: "Role updated." };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "You don't have permission to manage users." };
    }
    console.error("Failed to update role:", error);
    return { error: "Failed to update role." };
  }
}

/** Delete a user (admin only). Admins can't delete themselves. */
export async function deleteUserAction(userId: string): Promise<UserActionState> {
  try {
    const me = await requireAdmin();

    if (userId === me.id) {
      return { error: "You can't delete your own account." };
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(userId);

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    return { success: "User deleted." };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "You don't have permission to manage users." };
    }
    console.error("Failed to delete user:", error);
    return { error: "Failed to delete user." };
  }
}
