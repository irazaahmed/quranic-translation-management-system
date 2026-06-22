"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import {
  STAGES,
  computeCurrentStep,
  stageName,
  type EtStage,
  type StageCode,
} from "@/lib/et";
import { saveEtStagesAction } from "@/app/actions/etActions";

const TODAY = new Date().toISOString().slice(0, 10);

function fmt(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

type SkipState = "active" | "na" | "merged";

type Editable = {
  stage: StageCode;
  seq: number;
  person: string;
  sent_date: string;
  received_back_date: string;
  skip: SkipState;
};

function toEditable(stages: EtStage[]): Editable[] {
  const byCode = new Map(stages.map((s) => [s.stage, s]));
  return STAGES.map((s) => {
    const row = byCode.get(s.code);
    const skip: SkipState = row?.merged ? "merged" : row?.not_applicable ? "na" : "active";
    return {
      stage: s.code,
      seq: s.seq,
      person: row?.person ?? "",
      sent_date: row?.sent_date ?? "",
      received_back_date: row?.received_back_date ?? "",
      skip,
    };
  });
}

type StageState = "done" | "current" | "pending" | "na" | "merged";

const STATE_DOT: Record<StageState, string> = {
  done: "bg-green-500 text-white",
  current: "bg-emerald-600 text-white ring-4 ring-emerald-500/25",
  pending: "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  na: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600",
  merged: "bg-violet-100 text-violet-500 dark:bg-violet-900/30 dark:text-violet-400",
};
const STATE_LABEL: Record<StageState, string> = {
  done: "Done",
  current: "In progress",
  pending: "Pending",
  na: "N/A",
  merged: "Merged",
};

interface Props {
  itemId: string;
  stages: EtStage[];
  peopleNames: string[];
  finalEmailDate?: string | null;
}

export default function EtPipelineEditor({ itemId, stages, peopleNames, finalEmailDate }: Props) {
  const { canWrite } = usePermissions();
  const toast = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [rows, setRows] = useState<Editable[]>(() => toEditable(stages));
  const [dirty, setDirty] = useState(false);

  // Live current-step computation from the in-memory rows.
  const current = useMemo(
    () =>
      computeCurrentStep(
        rows.map((r) => ({
          id: "",
          item_id: itemId,
          stage: r.stage,
          seq: r.seq,
          person: r.person || null,
          sent_date: r.sent_date || null,
          received_back_date: r.received_back_date || null,
          not_applicable: r.skip === "na",
          merged: r.skip === "merged",
        })),
        finalEmailDate
      ),
    [rows, itemId, finalEmailDate]
  );

  const update = (i: number, patch: Partial<Editable>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    setDirty(true);
  };

  // After parts are merged, the leftover empty stages can be marked merged in one go.
  const emptyActiveCount = rows.filter(
    (r) => r.skip === "active" && !r.person && !r.sent_date && !r.received_back_date
  ).length;
  const markEmptyMerged = () => {
    setRows((prev) =>
      prev.map((r) =>
        r.skip === "active" && !r.person && !r.sent_date && !r.received_back_date
          ? { ...r, skip: "merged" as SkipState }
          : r
      )
    );
    setDirty(true);
  };

  const stageStateOf = (r: Editable): StageState => {
    if (r.skip === "merged") return "merged";
    if (r.skip === "na") return "na";
    if (r.received_back_date) return "done";
    if (r.stage === current.stage) return "current";
    return "pending";
  };

  const save = () => {
    startTransition(async () => {
      const res = await saveEtStagesAction(
        itemId,
        rows.map((r) => ({
          stage: r.stage,
          person: r.person.trim() || null,
          sent_date: r.sent_date || null,
          received_back_date: r.received_back_date || null,
          not_applicable: r.skip === "na",
          merged: r.skip === "merged",
        }))
      );
      if (res.error) {
        toast({ type: "error", message: res.error });
      } else {
        toast({ type: "success", message: "Pipeline saved." });
        setDirty(false);
        router.refresh();
      }
    });
  };

  // ---- Read-only view (viewers) ----
  if (!canWrite) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((r) => {
          const st = stageStateOf(r);
          return (
            <div key={r.stage} className={`rounded-xl border p-3 ${st === "current" ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"}`}>
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${STATE_DOT[st]}`}>
                  {st === "done" ? "✓" : r.seq}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.stage}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{stageName(r.stage)}</p>
                </div>
                <span className="ml-auto text-[11px] font-medium text-gray-400 dark:text-gray-500">{STATE_LABEL[st]}</span>
              </div>
              {r.skip === "merged" ? (
                <p className="mt-2 text-xs italic text-violet-600 dark:text-violet-400">Merged into the combined file — stage not needed.</p>
              ) : (
                <div className="mt-2 space-y-1 text-xs">
                  <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-400 dark:text-gray-500">Person: </span>{r.person || (st === "na" ? "N/A" : "—")}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="text-gray-400 dark:text-gray-500">Sent: </span>{fmt(r.sent_date || null)}
                    <span className="mx-1">→</span>
                    <span className="text-gray-400 dark:text-gray-500">Back: </span>{fmt(r.received_back_date || null)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ---- Editable view (staff) ----
  return (
    <div>
      <datalist id="et-people">
        {peopleNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((r, i) => {
          const st = stageStateOf(r);
          return (
            <div key={r.stage} className={`rounded-xl border p-3 ${st === "current" ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"} ${r.skip !== "active" ? "opacity-70" : ""}`}>
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${STATE_DOT[st]}`}>
                  {st === "done" ? "✓" : r.seq}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.stage}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{stageName(r.stage)}</p>
                </div>
                <select
                  aria-label={`${r.stage} state`}
                  value={r.skip}
                  onChange={(e) => update(i, { skip: e.target.value as SkipState })}
                  className="ml-auto rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-1 py-0.5 text-[11px] text-gray-600 dark:text-gray-300 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="na">N/A</option>
                  <option value="merged">Merged</option>
                </select>
              </div>

              {r.skip === "merged" ? (
                <p className="mt-2 text-xs italic text-violet-600 dark:text-violet-400">Merged into the combined file — stage not needed.</p>
              ) : r.skip === "na" ? (
                <p className="mt-2 text-xs italic text-gray-400 dark:text-gray-500">Not applicable for this item.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    list="et-people"
                    value={r.person}
                    onChange={(e) => update(i, { person: e.target.value })}
                    placeholder="Person…"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <input type="date" value={r.sent_date} onChange={(e) => update(i, { sent_date: e.target.value })} aria-label={`${r.stage} sent date`} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-1.5 py-1 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                    <button type="button" onClick={() => update(i, { sent_date: TODAY })} title="Sent today" className="flex-shrink-0 rounded-md bg-gray-100 dark:bg-gray-700 px-1.5 py-1 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">↑Today</button>
                  </div>
                  <div className="flex items-center gap-1">
                    <input type="date" value={r.received_back_date} onChange={(e) => update(i, { received_back_date: e.target.value })} aria-label={`${r.stage} received date`} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-1.5 py-1 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                    <button type="button" onClick={() => update(i, { received_back_date: TODAY })} title="Received today" className="flex-shrink-0 rounded-md bg-gray-100 dark:bg-gray-700 px-1.5 py-1 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">✓Today</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save bar */}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        {emptyActiveCount > 1 && (
          <button
            type="button"
            onClick={markEmptyMerged}
            className="mr-auto inline-flex items-center gap-1.5 rounded-lg border border-violet-300 dark:border-violet-800 px-3 py-2 text-sm font-medium text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
          >
            Mark {emptyActiveCount} empty stages as Merged
          </button>
        )}
        {dirty && <span className="text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>}
        <button
          type="button"
          onClick={save}
          disabled={isPending || !dirty}
          className="btn-press inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isPending && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isPending ? "Saving…" : "Save Pipeline"}
        </button>
      </div>
    </div>
  );
}
