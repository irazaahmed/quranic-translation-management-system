import DashboardLayout from "@/components/DashboardLayout";
import { getCachedEtItemRows } from "@/lib/etData";
import EtItemsList from "./EtItemsList";

export const dynamic = "force-dynamic";

export default async function EtItemsPage() {
  let rows: Awaited<ReturnType<typeof getCachedEtItemRows>> = [];
  let error: string | null = null;

  try {
    rows = await getCachedEtItemRows();
  } catch (err) {
    console.error("Failed to fetch ET items:", err);
    error = "Failed to load items. Have you run the migration and import yet?";
  }

  const active = rows.filter((r) => r.status !== "completed").length;
  const completed = rows.filter((r) => r.status === "completed").length;
  const unassigned = rows.filter((r) => r.status === "pending_assignment").length;

  return (
    <DashboardLayout>
      <div className="mb-4 sm:mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">English Translation</p>
        <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Work Items</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {rows.length} items in the production pipeline · {active} active · {completed} completed · {unassigned} unassigned
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          <p className="font-medium">{error}</p>
          <p className="mt-2 text-sm">
            Run <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">lib/migrations/add_english_translation.sql</code> in Supabase, then{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">python scripts/import_english_translation.py "&lt;file&gt;.xlsx"</code>.
          </p>
        </div>
      ) : (
        <EtItemsList items={rows} />
      )}
    </DashboardLayout>
  );
}
