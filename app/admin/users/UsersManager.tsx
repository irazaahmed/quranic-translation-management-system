"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserAction,
  updateUserRoleAction,
  deleteUserAction,
  type ManagedUser,
  type UserActionState,
} from "@/app/actions/userActions";
import type { Role } from "@/lib/auth";

const initialState: UserActionState = {};

const ROLE_BADGE: Record<Role, string> = {
  admin: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
  editor: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  viewer: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UsersManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: ManagedUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [createState, createFormAction, isCreating] = useActionState(
    createUserAction,
    initialState
  );
  const [showCreate, setShowCreate] = useState(false);
  const [rowMessage, setRowMessage] = useState<{ id: string; text: string; error: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ManagedUser | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (user: ManagedUser, role: Role) => {
    startTransition(async () => {
      const res = await updateUserRoleAction(user.id, role);
      setRowMessage({
        id: user.id,
        text: res.error || res.success || "",
        error: !!res.error,
      });
      router.refresh();
    });
  };

  const handleDelete = (user: ManagedUser) => {
    startTransition(async () => {
      const res = await deleteUserAction(user.id);
      setConfirmDelete(null);
      setRowMessage({
        id: user.id,
        text: res.error || res.success || "",
        error: !!res.error,
      });
      router.refresh();
    });
  };

  // After a successful create, close the form and refresh.
  useEffect(() => {
    if (createState.success) {
      setShowCreate(false);
      router.refresh();
    }
  }, [createState.success, router]);

  return (
    <div className="space-y-6">
      {/* Create user toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate((s) => !s)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          {showCreate ? "Close" : "Add User"}
        </button>
      </div>

      {/* Create user form */}
      {showCreate && (
        <form
          action={createFormAction}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">New User</h3>

          {createState.error && (
            <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {createState.error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Ahmed Ali"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                defaultValue="viewer"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="viewer">Viewer — can only view</option>
                <option value="editor">Editor — can add/edit/delete</option>
                <option value="admin">Admin — full access + users</option>
              </select>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="text"
                required
                minLength={6}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors duration-200"
            >
              {isCreating ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {initialUsers.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.full_name || "—"}
                      {isSelf && <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">(you)</span>}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                    {rowMessage?.id === user.id && rowMessage.text && (
                      <div className={`mt-1 text-xs ${rowMessage.error ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {rowMessage.text}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_BADGE[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={user.role}
                        disabled={isPending || isSelf}
                        onChange={(e) => handleRoleChange(user, e.target.value as Role)}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isSelf ? "You can't change your own role" : "Change role"}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => setConfirmDelete(user)}
                        disabled={isPending || isSelf}
                        title={isSelf ? "You can't delete yourself" : "Delete user"}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 dark:border-red-700 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete User</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Delete <span className="font-medium text-gray-900 dark:text-white">{confirmDelete.email}</span>? They will lose access immediately. This cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={isPending}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors duration-200"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
