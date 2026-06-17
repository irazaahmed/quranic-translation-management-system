"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { updateProgressAction, ProgressFormState } from "@/app/actions/progressActions";
import { STAGES, TOTAL_PARAS, type LanguageProgress } from "@/lib/progress";

const initialState: ProgressFormState = {};

export default function ProgressEditForm({ lang }: { lang: LanguageProgress }) {
  const [state, formAction, isPending] = useActionState(updateProgressAction, initialState);

  // Live-controlled para values so the bars/summary update as you type.
  const [paras, setParas] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const s of STAGES) init[s.key] = lang.stages[s.key].current_para;
    return init;
  });

  function setPara(key: string, value: number) {
    const v = Math.max(0, Math.min(TOTAL_PARAS, Number.isNaN(value) ? 0 : value));
    setParas((prev) => ({ ...prev, [key]: v }));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="language_id" value={lang.languageId} />

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6">
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          For each stage, enter how many of the {TOTAL_PARAS} paras have reached
          it, and (optionally) the date it advanced.{" "}
          <span className="font-medium">Translation</span> comes first, then{" "}
          <span className="font-medium">Comparison</span> — no other stage can be
          ahead of these two. The remaining stages can move in any order.
        </p>

        <div className="space-y-5">
          {STAGES.map((meta, idx) => {
            const row = lang.stages[meta.key];
            const value = paras[meta.key] ?? 0;
            const pct = Math.round((value / TOTAL_PARAS) * 100);
            return (
              <div
                key={meta.key}
                className="rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-900/30 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${meta.bar} text-[11px] font-bold text-white`}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {meta.label}
                  </span>
                  <span className="ml-auto tabular-nums text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {value}/{TOTAL_PARAS}
                  </span>
                </div>

                {/* Live bar */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className={`h-full rounded-full ${meta.bar} transition-all duration-300`} style={{ width: `${pct}%` }} />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {/* Current para */}
                  <div>
                    <label htmlFor={`para_${meta.key}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Para reached (0–{TOTAL_PARAS})
                    </label>
                    <input
                      type="number"
                      id={`para_${meta.key}`}
                      name={`para_${meta.key}`}
                      min={0}
                      max={TOTAL_PARAS}
                      value={value}
                      onChange={(e) => setPara(meta.key, parseInt(e.target.value, 10))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Since date */}
                  <div>
                    <label htmlFor={`since_${meta.key}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Since (optional)
                    </label>
                    <input
                      type="date"
                      id={`since_${meta.key}`}
                      name={`since_${meta.key}`}
                      defaultValue={row.since_date ?? ""}
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor={`notes_${meta.key}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Note (optional)
                    </label>
                    <input
                      type="text"
                      id={`notes_${meta.key}`}
                      name={`notes_${meta.key}`}
                      defaultValue={row.notes ?? ""}
                      placeholder="e.g. on hold"
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {state.error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-400">{state.error}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-4">
        <Link
          href="/progress"
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isPending && (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {isPending ? "Saving..." : "Save Progress"}
        </button>
      </div>
    </form>
  );
}
