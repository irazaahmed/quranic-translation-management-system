import {
  getStagesForLanguage,
  TOTAL_PARAS,
  stagePercent,
  type StageKey,
  type StageProgressRow,
} from "@/lib/progress";

function formatSince(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(date + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Read-only display of a language's 6-stage para progress as a staircase of
 * labelled bars. Used on the progress board and the language detail page.
 */
export default function StageProgressBars({
  languageName,
  stages,
  showSince = true,
}: {
  /** Language name — selects which pipeline (e.g. Braille) to display. */
  languageName: string;
  stages: Record<StageKey, StageProgressRow>;
  showSince?: boolean;
}) {
  const metas = getStagesForLanguage(languageName);
  return (
    <div className="space-y-3">
      {metas.map((meta) => {
        const row = stages[meta.key];
        const para = row.current_para;
        const pct = stagePercent(para);
        const since = showSince ? formatSince(row.since_date) : null;

        return (
          <div key={meta.key}>
            <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${meta.dot}`} />
                <span className="truncate font-medium text-gray-700 dark:text-gray-300">
                  {meta.label}
                </span>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {since && (
                  <span className="hidden text-[11px] text-gray-400 dark:text-gray-500 sm:inline">
                    since {since}
                  </span>
                )}
                <span className="tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                  {para}
                  <span className="text-gray-400 dark:text-gray-500">/{TOTAL_PARAS}</span>
                </span>
              </div>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700/60">
              <div
                className={`h-full rounded-full ${meta.bar} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
