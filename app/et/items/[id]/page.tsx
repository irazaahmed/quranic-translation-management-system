import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCachedEtItem, getCachedEtPeople } from "@/lib/etData";
import { BOARD_LABELS, computeCurrentStep, daysSince, typeLabel } from "@/lib/et";
import EtPipelineEditor from "./EtPipelineEditor";
import EtItemActions from "./EtItemActions";

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

export default async function EtItemDetailPage({ params }: Props) {
  const { id } = await params;
  const [item, people] = await Promise.all([getCachedEtItem(id), getCachedEtPeople()]);
  if (!item) notFound();

  const current = computeCurrentStep(item.stages);
  const sinceDays = daysSince(current.since);
  const peopleNames = people.map((p) => p.name);

  return (
    <DashboardLayout>
      {/* Back + breadcrumb */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href="/et/items" className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Work Items
        </Link>
        <EtItemActions itemId={item.id} title={item.title} />
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

      {/* Pipeline (editable for staff, read-only for viewers) */}
      <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Pipeline</h2>
      <EtPipelineEditor itemId={item.id} stages={item.stages} peopleNames={peopleNames} />

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
