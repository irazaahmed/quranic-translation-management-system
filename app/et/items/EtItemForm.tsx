"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  BOARD_LABELS,
  TYPE_LABELS,
  type EtItem,
  type ItemBoard,
} from "@/lib/et";
import {
  createEtItemAction,
  updateEtItemAction,
  type EtFormState,
} from "@/app/actions/etActions";

const initialState: EtFormState = {};

const inputCls =
  "mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300";

interface Props {
  item?: EtItem; // present => edit mode
}

export default function EtItemForm({ item }: Props) {
  const isEdit = !!item;
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateEtItemAction : createEtItemAction,
    initialState
  );

  const cancelHref = isEdit ? `/et/items/${item!.id}` : "/et/items";

  return (
    <>
      {state.error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300">{state.error}</p>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="item_id" value={item!.id} />}

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Title */}
            <div className="sm:col-span-2">
              <label htmlFor="title" className={labelCls}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                defaultValue={item?.title ?? ""}
                className={inputCls}
                placeholder="e.g., 260710 Fri bayan - Khof-e-Khuda Key Faidy (10-7-26)"
              />
            </div>

            {/* Board */}
            <div>
              <label htmlFor="board" className={labelCls}>Board</label>
              <select id="board" name="board" defaultValue={item?.board ?? "main_2026"} className={inputCls}>
                {(Object.keys(BOARD_LABELS) as ItemBoard[]).map((b) => (
                  <option key={b} value={b}>{BOARD_LABELS[b]}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className={labelCls}>Type</label>
              <select id="type" name="type" defaultValue={item?.type ?? ""} className={inputCls}>
                <option value="">— Select type —</option>
                {Object.entries(TYPE_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>{label} ({code})</option>
                ))}
              </select>
            </div>

            {/* Received date */}
            <div>
              <label htmlFor="received_date" className={labelCls}>Received date</label>
              <input type="date" id="received_date" name="received_date" defaultValue={item?.received_date ?? ""} className={inputCls} />
            </div>

            {/* Word count */}
            <div>
              <label htmlFor="word_count" className={labelCls}>Word count</label>
              <input type="number" min="0" id="word_count" name="word_count" defaultValue={item?.word_count ?? ""} className={inputCls} placeholder="e.g., 5367" />
            </div>

            {/* Delivery date */}
            <div>
              <label htmlFor="delivery_date" className={labelCls}>
                Delivery date <span className="font-normal text-gray-400 dark:text-gray-500">(for reminders)</span>
              </label>
              <input type="date" id="delivery_date" name="delivery_date" defaultValue={item?.delivery_date ?? ""} className={inputCls} />
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className={labelCls}>Priority</label>
              <select id="priority" name="priority" defaultValue={item?.priority ?? ""} className={inputCls}>
                <option value="">— None —</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Further process / notes */}
            <div className="sm:col-span-2">
              <label htmlFor="further_process" className={labelCls}>Notes / Further process</label>
              <textarea id="further_process" name="further_process" rows={3} defaultValue={item?.further_process ?? ""} className={inputCls} placeholder="Any special instructions or history…" />
            </div>
          </div>

          {!isEdit && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              The 8 pipeline stages (TR → FPR) are created empty. You can assign people and dates on the item page right after creating it.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href={cancelHref} className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
          >
            {isPending && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Item"}
          </button>
        </div>
      </form>
    </>
  );
}
