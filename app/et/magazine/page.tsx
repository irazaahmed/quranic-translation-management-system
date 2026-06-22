import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { getCachedEtItemRows, type EtItemRow } from "@/lib/etData";
import { STAGES, daysSince, isMagazineType, stageBadgeClasses } from "@/lib/et";

export const dynamic = "force-dynamic";

function fmt(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function EtMagazinePage() {
  let rows: EtItemRow[] = [];
  let error: string | null = null;
  try {
    rows = await getCachedEtItemRows();
  } catch (err) {
    console.error("Failed to fetch ET items:", err);
    error = "Failed to load. Have you run the migrations and import yet?";
  }

  const articles = rows
    .filter((r) => isMagazineType(r.type))
    .sort((a, b) => a.title.localeCompare(b.title));

  const active = articles.filter((a) => a.derivedStatus !== "completed");
  const completed = articles.filter((a) => a.derivedStatus === "completed");

  return (
    <DashboardLayout>
      <div className="mb-4 sm:mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">English Translation</p>
          <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Magazine</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {articles.length} articles · {active.length} active · {completed.length} completed
          </p>
        </div>
        <Link href="/et" className="btn-press inline-flex flex-shrink-0 items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
          ← Dashboard
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{error}</div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center text-gray-500 dark:text-gray-400">
          No magazine articles yet. Add an item with type “Magazine”.
        </div>
      ) : (
        <>
          {/* Mini stage legend */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <span key={s.code} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${stageBadgeClasses(s.code)}`} title={s.name}>{s.code}</span>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {["Article", "Current Step", "Holder", "Progress", "Since"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {articles.map((row) => {
                  const d = daysSince(row.current.since);
                  return (
                    <tr key={row.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 max-w-[360px]">
                        <Link href={`/et/items/${row.id}`} className="block truncate text-sm font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400" title={row.title}>
                          {row.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${stageBadgeClasses(row.current.stage, row.current.completed)}`}>
                          {row.current.stage ? `${row.current.stage} · ${row.current.label}` : row.current.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{row.current.holder || "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm tabular-nums text-gray-600 dark:text-gray-400">{row.current.doneCount}/{row.current.totalCount}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {fmt(row.current.since)}
                        {d !== null && d > 30 && (
                          <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">{d}d</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
