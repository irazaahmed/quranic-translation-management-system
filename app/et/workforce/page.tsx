import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { getCachedEtItemRows, getCachedEtPeople, type EtItemRow } from "@/lib/etData";
import { stageBadgeClasses, type StageCode } from "@/lib/et";

export const dynamic = "force-dynamic";

const KNOWN_SKILLS: StageCode[] = ["TR", "IF", "CM", "ED", "NR", "ST", "FF", "FPR"];

/** Pull recognised stage codes out of a free-text skills string. */
function parseSkills(skills: string | null): StageCode[] {
  if (!skills) return [];
  const upper = skills.toUpperCase();
  return KNOWN_SKILLS.filter((s) => new RegExp(`\\b${s}\\b`).test(upper));
}

export default async function EtWorkforcePage() {
  let people: Awaited<ReturnType<typeof getCachedEtPeople>> = [];
  let rows: EtItemRow[] = [];
  let error: string | null = null;
  try {
    [people, rows] = await Promise.all([getCachedEtPeople(), getCachedEtItemRows()]);
  } catch (err) {
    console.error("Failed to fetch workforce:", err);
    error = "Failed to load. Have you run the migration and import yet?";
  }

  // Active workload per holder (match on the name as stored in stages).
  const load = new Map<string, number>();
  rows
    .filter((r) => r.derivedStatus !== "completed" && !r.stopped)
    .forEach((r) => {
      if (r.current.holder) load.set(r.current.holder, (load.get(r.current.holder) || 0) + 1);
    });

  // Best-effort match a person's name to their workload (the stage "person"
  // strings sometimes differ slightly from the Workforce name, e.g. "Jawwad
  // Jamil (USA)" vs "Jawwad Jamil USA").
  const loadFor = (name: string): number => {
    if (load.has(name)) return load.get(name)!;
    const first = name.split(/[\s(]/)[0].toLowerCase();
    let total = 0;
    for (const [holder, count] of load) {
      if (holder.toLowerCase().startsWith(first)) total += count;
    }
    return total;
  };

  return (
    <DashboardLayout>
      <div className="mb-4 sm:mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">English Translation</p>
          <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Workforce</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{people.length} team members</p>
        </div>
        <Link href="/et" className="btn-press inline-flex flex-shrink-0 items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
          ← Dashboard
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{error}</div>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {people.map((p) => {
            const skills = parseSkills(p.skills);
            const count = loadFor(p.name);
            return (
              <div key={p.id} className="gloss card-hover rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Avatar name={p.name} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                    {p.email && <p className="truncate text-xs text-gray-500 dark:text-gray-400">{p.email}</p>}
                  </div>
                  <Link
                    href={`/et/items?holder=${encodeURIComponent(p.name)}`}
                    className="flex-shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    title="Active items"
                  >
                    {count} active
                  </Link>
                </div>

                {skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {skills.map((s) => (
                      <span key={s} className={`rounded-full px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${stageBadgeClasses(s)}`}>{s}</span>
                    ))}
                  </div>
                )}
                {(p.skills && skills.length === 0) && (
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{p.skills}</p>
                )}
                {p.working_hours && (
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">🕒 {p.working_hours}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
