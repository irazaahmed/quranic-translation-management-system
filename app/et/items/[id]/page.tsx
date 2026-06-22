import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCachedEtItem } from "@/lib/etData";
import {
  BOARD_LABELS,
  STAGES,
  computeCurrentStep,
  daysSince,
  stageName,
  typeLabel,
  type EtStage,
  type StageCode,
} from "@/lib/et";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

function fmt(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

type StageState = "done" | "current" | "pending" | "na";

function stageState(stage: EtStage, currentStage: StageCode | null): StageState {
  if (stage.not_applicable) return "na";
  if (stage.received_back_date) return "done";
  if (stage.stage === currentStage) return "current";
  return "pending";
}

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

export default async function EtItemDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await getCachedEtItem(id);
  if (!item) notFound();

  const current = computeCurrentStep(item.stages);
  const sinceDays = daysSince(current.since);

  // Index stages by code so we can render the canonical 8-stage pipeline order.
  const byCode = new Map(item.stages.map((s) => [s.stage, s]));

  return (
    <DashboardLayout>
      {/* Back + breadcrumb */}
      <div className="mb-4">
        <Link href="/et/items" className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Work Items
        </Link>
      </div>

      {/* Header card */}
      <div className="gloss mb-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            {BOARD_LABELS[item.board]}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {typeLabel(item.type)}
          </span>
          {item.word_count != null && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {item.word_count.toLocaleString()} words
            </span>
          )}
        </div>
        <h1 className="mt-2 text-lg sm:text-2xl font-bold text-gray-900 dark:text-white break-words">{item.title}</h1>

        {/* Current step banner */}
        <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-4">
          {current.completed ? (
            <p className="text-sm font-medium text-green-700 dark:text-green-400">✓ Completed — all applicable stages done.</p>
          ) : current.unassigned ? (
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending assignment — no stage has been assigned yet.</p>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Currently at{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{current.label}</span>
              {current.holder && (
                <>
                  {" "}with <span className="font-semibold text-gray-900 dark:text-white">{current.holder}</span>
                </>
              )}
              {current.since && (
                <>
                  {" "}since {fmt(current.since)}
                  {sinceDays != null && (
                    <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs font-medium ${sinceDays > 30 ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
                      {sinceDays}d
                    </span>
                  )}
                </>
              )}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                style={{ width: `${current.totalCount ? (current.doneCount / current.totalCount) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{current.doneCount}/{current.totalCount}</span>
          </div>
        </div>

        {item.received_date && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Received: {fmt(item.received_date)}</p>
        )}
      </div>

      {/* Pipeline */}
      <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Pipeline</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((s) => {
          const stage = byCode.get(s.code);
          const st: StageState = stage ? stageState(stage, current.stage) : "pending";
          return (
            <div
              key={s.code}
              className={`rounded-xl border p-3 ${st === "current" ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"}`}
            >
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${STATE_DOT[st]}`}>
                  {st === "done" ? "✓" : s.seq}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.code}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{stageName(s.code)}</p>
                </div>
                <span className="ml-auto text-[11px] font-medium text-gray-400 dark:text-gray-500">{STATE_LABEL[st]}</span>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="text-gray-400 dark:text-gray-500">Person: </span>
                  {stage?.person || (st === "na" ? "N/A" : "—")}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="text-gray-400 dark:text-gray-500">Sent: </span>{fmt(stage?.sent_date ?? null)}
                  <span className="mx-1">→</span>
                  <span className="text-gray-400 dark:text-gray-500">Back: </span>{fmt(stage?.received_back_date ?? null)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Further process notes */}
      {item.further_process && (
        <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notes / Further process</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">{item.further_process}</p>
        </div>
      )}
    </DashboardLayout>
  );
}
