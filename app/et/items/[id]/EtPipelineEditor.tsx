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

type Editable = {
  stage: StageCode;
  seq: number;
  person: string;
  sent_date: string;
  received_back_date: string;
  not_applicable: boolean;
};

function toEditable(stages: EtStage[]): Editable[] {
  const byCode = new Map(stages.map((s) => [s.stage, s]));
  return STAGES.map((s) => {
    const row = byCode.get(s.code);
    return {
      stage: s.code,
      seq: s.seq,
      person: row?.person ?? "",
      sent_date: row?.sent_date ?? "",
      received_back_date: row?.received_back_date ?? "",
      not_applicable: row?.not_applicable ?? false,
    };
  });
}

type StageState = "done" | "current" | "pending" | "na";

const STATE_DOT: Record<StageState, string> = {
  done: "bg-green-500 text-white",
  current: "bg-emerald-600 text-white ring-4 ring-emerald-500/25",
  pending: "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  na: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600",
};
const STATE_LABEL: Record<StageState, string> = {
  done: "Done",
  current: "In progress",
  pending: "Pending",
  na: "N/A",
};

interface Props {
  itemId: string;
  stages: EtStage[];
  peopleNames: string[];
}

export default function EtPipelineEditor({ itemId, stages, peopleNames }: Props) {
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
          not_applicable: r.not_applicable,
        }))
      ),
    [rows, itemId]
  );

  const update = (i: number, patch: Partial<Editable>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    setDirty(true);
  };

  const stageStateOf = (r: Editable): StageState => {
    if (r.not_applicable) return "na";
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
          not_applicable: r.not_applicable,
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
              <div className="mt-2 space-y-1 text-xs">
                <p className="text-gray-700 dark:text-gray-300"><span className="text-gray-400 dark:text-gray-500">Person: </span>{r.person || (st === "na" ? "N/A" : "—")}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="text-gray-400 dark:text-gray-500">Sent: </span>{fmt(r.sent_date || null)}
                  <span className="mx-1">→</span>
                  <span className="text-gray-400 dark:text-gray-500">Back: </span>{fmt(r.received_back_date || null)}
                </p>
              </div>
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
            <div key={r.stage} className={`rounded-xl border p-3 ${st === "current" ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"} ${r.not_applicable ? "opacity-60" : ""}`}>
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${STATE_DOT[st]}`}>
                  {st === "done" ? "✓" : r.seq}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.stage}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{stageName(r.stage)}</p>
                </div>
                <label className="ml-auto flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <input type="checkbox" checked={r.not_applicable} onChange={(e) => update(i, { not_applicable: e.target.checked })} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  N/A
                </label>
              </div>

              {!r.not_applicable && (
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
      <div className="mt-4 flex items-center justify-end gap-3">
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
