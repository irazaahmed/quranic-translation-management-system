"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { deleteEtItemAction, setEtStoppedAction } from "@/app/actions/etActions";

export default function EtItemActions({ itemId, title, stopped }: { itemId: string; title: string; stopped: boolean }) {
  const { canWrite } = usePermissions();
  const toast = useToast();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [stopPending, startStop] = useTransition();

  if (!canWrite) return null;

  const toggleStopped = () => {
    startStop(async () => {
      const res = await setEtStoppedAction(itemId, !stopped);
      if (res.error) toast({ type: "error", message: res.error });
      else {
        toast({ type: "success", message: stopped ? "Project resumed." : "Project stopped." });
        router.refresh();
      }
    });
  };

  const doDelete = () => {
    startTransition(async () => {
      const res = await deleteEtItemAction(itemId);
      if (res.error) {
        toast({ type: "error", message: res.error });
      } else {
        toast({ type: "success", message: "Item deleted." });
        router.push("/et/items");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleStopped}
        disabled={stopPending}
        className={`btn-press inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
          stopped
            ? "border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        {stopped ? "Resume" : "Stop"}
      </button>
      <Link
        href={`/et/items/${itemId}/edit`}
        className="btn-press inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </Link>

      {confirming ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={doDelete}
            disabled={isPending}
            className="btn-press inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Deleting…" : "Confirm delete"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          title={`Delete "${title}"`}
          className="btn-press inline-flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-800 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      )}
    </div>
  );
}
