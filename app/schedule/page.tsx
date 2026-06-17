import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { StaffOnly } from "@/components/AuthProvider";
import { getCachedScheduleData, ScheduleEntry } from "@/lib/cachedData";
import {
  WEEKDAYS,
  computeScheduleStatus,
  stateBadgeClasses,
  type ScheduleState,
} from "@/lib/schedule";
import AssignDaySelect from "./AssignDaySelect";

export const dynamic = "force-dynamic";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATE_ORDER: Record<ScheduleState, number> = {
  overdue: 0,
  today: 1,
  due: 2,
  done: 3,
  none: 4,
};

export default async function SchedulePage() {
  let entries: ScheduleEntry[] = [];
  let error: string | null = null;

  try {
    entries = await getCachedScheduleData();
  } catch (err) {
    console.error("Failed to load schedule:", err);
    error = "Failed to load the meeting schedule.";
  }

  const today = new Date();

  // Attach computed status to each entry.
  const withStatus = entries.map((e) => ({
    entry: e,
    status: computeScheduleStatus(e.assigned_day, e.lastMeeting, today),
  }));

  // Summary counts.
  const counts = { done: 0, today: 0, due: 0, overdue: 0, none: 0 };
  withStatus.forEach(({ status }) => {
    counts[status.state]++;
  });

  // Group by weekday; unscheduled collected separately.
  const byDay = new Map<string, typeof withStatus>();
  const unscheduled: typeof withStatus = [];
  for (const item of withStatus) {
    const day = item.entry.assigned_day;
    if (day && WEEKDAYS.includes(day as never)) {
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(item);
    } else {
      unscheduled.push(item);
    }
  }
  // Sort each day's rows: most urgent first, then by language name.
  for (const rows of byDay.values()) {
    rows.sort(
      (a, b) =>
        STATE_ORDER[a.status.state] - STATE_ORDER[b.status.state] ||
        a.entry.language.localeCompare(b.entry.language)
    );
  }
  unscheduled.sort((a, b) => a.entry.language.localeCompare(b.entry.language));

  const todayName = today.toLocaleDateString("en-US", { weekday: "long" });

  const summaryChips: Array<{ label: string; value: number; cls: string }> = [
    { label: "Met this week", value: counts.done, cls: stateBadgeClasses("done") },
    { label: "Due today", value: counts.today, cls: stateBadgeClasses("today") },
    { label: "Due this week", value: counts.due, cls: stateBadgeClasses("due") },
    { label: "Overdue", value: counts.overdue, cls: stateBadgeClasses("overdue") },
    { label: "Unscheduled", value: counts.none, cls: stateBadgeClasses("none") },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient">
              Meeting Schedule
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Weekly cadence — every language has a meeting each week on its assigned day.
              Missed ones escalate to an overdue reminder after 14 days.
            </p>
          </div>
          <StaffOnly>
            <Link
              href="/meetings/new"
              className="btn-press inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Record Meeting
            </Link>
          </StaffOnly>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Summary chips */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {summaryChips.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
          >
            <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${c.cls}`}>
              {c.label}
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Day groups */}
      <div className="space-y-6">
        {WEEKDAYS.filter((d) => byDay.has(d)).map((day) => {
          const rows = byDay.get(day)!;
          const isToday = day === todayName;
          return (
            <section
              key={day}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
            >
              <div
                className={`flex items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700 px-5 py-3 ${
                  isToday ? "bg-blue-50 dark:bg-blue-900/15" : "bg-gray-50 dark:bg-gray-800/40"
                }`}
              >
                <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                  {day}
                  {isToday && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Today
                    </span>
                  )}
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {rows.length} {rows.length === 1 ? "language" : "languages"}
                </span>
              </div>

              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {rows.map(({ entry, status }) => (
                  <li
                    key={entry.id}
                    className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/languages/${entry.id}`}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 truncate"
                        >
                          {entry.language}
                          <span className="font-normal text-gray-400"> ({entry.country})</span>
                        </Link>
                        <span
                          className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${stateBadgeClasses(
                            status.state
                          )}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {entry.projectName ? `${entry.projectName} · ` : ""}
                        Last: {formatDate(entry.lastMeeting)}
                        {entry.nextMeeting ? ` · Next: ${formatDate(entry.nextMeeting)}` : ""}
                        {entry.responsible_person ? ` · ${entry.responsible_person}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-2">
                      <StaffOnly>
                        <AssignDaySelect languageId={entry.id} currentDay={entry.assigned_day} />
                        {status.state !== "done" && (
                          <Link
                            href={`/meetings/new?project=${entry.project_id ?? ""}&language=${entry.id}`}
                            className="btn-press inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors whitespace-nowrap"
                          >
                            Record meeting
                          </Link>
                        )}
                      </StaffOnly>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {/* Unscheduled */}
        {unscheduled.length > 0 && (
          <section className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 px-5 py-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Unscheduled{" "}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  — no fixed meeting day yet
                </span>
              </h2>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {unscheduled.map(({ entry }) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/languages/${entry.id}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 truncate"
                    >
                      {entry.language}
                      <span className="font-normal text-gray-400"> ({entry.country})</span>
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {entry.projectName ? `${entry.projectName} · ` : ""}
                      Last: {formatDate(entry.lastMeeting)}
                    </p>
                  </div>
                  <StaffOnly>
                    <AssignDaySelect languageId={entry.id} currentDay={entry.assigned_day} />
                  </StaffOnly>
                </li>
              ))}
            </ul>
          </section>
        )}

        {withStatus.length === 0 && !error && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No languages yet. Add languages to start building the schedule.
            </p>
          </div>
        )}
      </div>

      {/* Reference: original fortnightly schedule */}
      <details className="mt-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
          Reference: original fortnightly schedule
        </summary>
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/QTMS Record Meeting.png"
            alt="Fortnightly meeting schedule reference"
            className="max-w-full sm:max-w-md rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
      </details>
    </DashboardLayout>
  );
}
