"use client";

import { createContext, useContext } from "react";
import type { AuthProfile, Role } from "@/lib/auth";

interface Permissions {
  profile: AuthProfile | null;
  role: Role | null;
  isLoggedIn: boolean;
  canWrite: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<Permissions>({
  profile: null,
  role: null,
  isLoggedIn: false,
  canWrite: false,
  isAdmin: false,
});

export function AuthProvider({
  profile,
  children,
}: {
  profile: AuthProfile | null;
  children: React.ReactNode;
}) {
  const role = profile?.role ?? null;
  const value: Permissions = {
    profile,
    role,
    isLoggedIn: !!profile,
    canWrite: role === "admin" || role === "editor",
    isAdmin: role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function usePermissions(): Permissions {
  return useContext(AuthContext);
}

/** Renders children only for logged-in admin/editor users. */
export function StaffOnly({ children }: { children: React.ReactNode }) {
  const { canWrite } = usePermissions();
  return canWrite ? <>{children}</> : null;
}

/** Renders children only for logged-in admin users. */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin } = usePermissions();
  return isAdmin ? <>{children}</> : null;
}
