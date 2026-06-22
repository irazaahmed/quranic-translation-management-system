import Link from "next/link";
import Tilt from "@/components/Tilt";

interface ModuleCardsProps {
  quranicLanguages: number;
  englishActive: number;
  englishTotal: number;
}

/**
 * The two workspaces of the Translation Management System, shown as entry
 * cards on the home page so the user can jump into either module.
 */
export default function ModuleCards({ quranicLanguages, englishActive, englishTotal }: ModuleCardsProps) {
  return (
    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
      {/* Quranic Translation */}
      <Tilt max={6} scale={1.01} className="rounded-2xl">
        <Link
          href="/languages"
          className="gloss group relative block h-full overflow-hidden rounded-2xl border border-emerald-200/70 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 p-5 shadow-sm transition-shadow hover:shadow-xl"
        >
          <div className="flex items-start justify-between">
            <div className="wobble-3d rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 text-white shadow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <span className="text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{quranicLanguages}</span>
          </div>
          <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">Quranic Translation</h3>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{quranicLanguages} languages · meetings & weekly schedule</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400 group-hover:gap-2 transition-all">
            Open <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </span>
        </Link>
      </Tilt>

      {/* English Translation */}
      <Tilt max={6} scale={1.01} className="rounded-2xl">
        <Link
          href="/et"
          className="gloss group relative block h-full overflow-hidden rounded-2xl border border-blue-200/70 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 p-5 shadow-sm transition-shadow hover:shadow-xl"
        >
          <div className="flex items-start justify-between">
            <div className="wobble-3d rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5 text-white shadow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-3xl font-bold tabular-nums text-blue-700 dark:text-blue-400">{englishActive}</span>
          </div>
          <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">English Translation</h3>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{englishActive} active · {englishTotal} items in the pipeline</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-700 dark:text-blue-400 group-hover:gap-2 transition-all">
            Open <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </span>
        </Link>
      </Tilt>
    </div>
  );
}
