// ============================================================
// lib/schedule.ts
// Pure helpers for the weekly meeting schedule. No server-only
// imports here so this can be used from both client and server.
//
// Cadence: a meeting is expected every 7 days on the language's
// assigned weekday. If it doesn't happen, an escalated reminder
// shows after 14 days (matches the dashboard "needs attention").
// ============================================================

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

/** JS getDay() is 0=Sunday..6=Saturday. Map to our weekday names. */
const JS_DAY_TO_NAME: Weekday[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function weekdayName(date: Date): Weekday {
  return JS_DAY_TO_NAME[date.getDay()];
}

/** Whole days between two dates (ignoring time of day). */
function daysBetween(from: Date, to: Date): number {
  const a = new Date(from);
  a.setHours(0, 0, 0, 0);
  const b = new Date(to);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

/**
 * The date of the next occurrence of `day` on or after `from`.
 * Used to suggest a "next meeting date" that matches the schedule.
 */
export function nextOccurrenceOf(day: Weekday, from: Date = new Date()): Date {
  const targetIdx = WEEKDAYS.indexOf(day); // 0=Mon..6=Sun
  const result = new Date(from);
  result.setHours(0, 0, 0, 0);
  // Convert JS getDay (0=Sun) to our index (0=Mon)
  const currentIdx = (result.getDay() + 6) % 7;
  let delta = (targetIdx - currentIdx + 7) % 7;
  if (delta === 0) delta = 7; // strictly "next", never today
  result.setDate(result.getDate() + delta);
  return result;
}

export type ScheduleState = "done" | "today" | "due" | "overdue" | "none";

export interface ScheduleStatus {
  state: ScheduleState;
  /** Whole days since the most recent recorded meeting (null if never met). */
  daysSinceLast: number | null;
  /** Human label for badges. */
  label: string;
}

/**
 * Work out where a language stands against its weekly cadence.
 *
 * @param assignedDay  the language's scheduled weekday (or null)
 * @param lastMeeting  ISO date of the most recent recorded meeting (or null)
 * @param today        reference "now" (defaults to current date)
 */
export function computeScheduleStatus(
  assignedDay: string | null,
  lastMeeting: string | null,
  today: Date = new Date()
): ScheduleStatus {
  if (!assignedDay || !WEEKDAYS.includes(assignedDay as Weekday)) {
    return { state: "none", daysSinceLast: null, label: "Unscheduled" };
  }

  const daysSinceLast = lastMeeting ? daysBetween(new Date(lastMeeting), today) : null;

  // Met within the last week → this cycle is satisfied.
  if (daysSinceLast !== null && daysSinceLast < 7) {
    return { state: "done", daysSinceLast, label: "Met this week" };
  }

  // Not met this week → a meeting is owed.
  const isAssignedToday = weekdayName(today) === assignedDay;

  if (isAssignedToday) {
    return { state: "today", daysSinceLast, label: "Due today" };
  }

  // 14-day escalation (or never met) → overdue reminder.
  if (daysSinceLast === null || daysSinceLast >= 14) {
    return {
      state: "overdue",
      daysSinceLast,
      label: daysSinceLast === null ? "No meeting yet" : `${daysSinceLast} days overdue`,
    };
  }

  return { state: "due", daysSinceLast, label: "Due this week" };
}

/** Tailwind classes for each state's badge. */
export function stateBadgeClasses(state: ScheduleState): string {
  switch (state) {
    case "done":
      return "bg-emerald-100 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-400";
    case "today":
      return "bg-blue-100 dark:bg-blue-900/25 text-blue-700 dark:text-blue-400";
    case "due":
      return "bg-amber-100 dark:bg-amber-900/25 text-amber-700 dark:text-amber-400";
    case "overdue":
      return "bg-red-100 dark:bg-red-900/25 text-red-700 dark:text-red-400";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
  }
}
