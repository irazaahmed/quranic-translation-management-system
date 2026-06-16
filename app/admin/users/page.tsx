import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { listUsers, type ManagedUser } from "@/app/actions/userActions";
import UsersManager from "./UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // Defense-in-depth: middleware already guards /admin, but re-check here.
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  let users: ManagedUser[] = [];
  let error: string | null = null;

  try {
    users = await listUsers();
  } catch (err) {
    console.error("Failed to load users:", err);
    error = "Failed to load users.";
  }

  return (
    <DashboardLayout>
      <div className="mb-6 sm:mb-8">
        <nav className="mb-2 sm:mb-3 flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
            Dashboard
          </Link>
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <span className="text-gray-900 dark:text-white font-medium">User Management</span>
        </nav>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Create users and control who can view, edit, or administer the system.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : (
        <UsersManager initialUsers={users} currentUserId={profile.id} />
      )}
    </DashboardLayout>
  );
}
