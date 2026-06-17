"use client";

import { useActionState, useEffect, useRef } from "react";
import { setAssignedDayAction, ScheduleActionState } from "@/app/actions/scheduleActions";
import { WEEKDAYS } from "@/lib/schedule";
import { useToast } from "@/components/Toast";

const initialState: ScheduleActionState = {};

/**
 * Inline weekday selector used on the Schedule page. Submits on change so staff
 * can re-assign a language's meeting day without leaving the page.
 */
export default function AssignDaySelect({
  languageId,
  currentDay,
}: {
  languageId: string;
  currentDay: string | null;
}) {
  const [state, formAction] = useActionState(setAssignedDayAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast({ type: "error", message: state.error });
    else if (state.success) toast({ type: "success", message: "Schedule updated" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="language_id" value={languageId} />
      <select
        name="assigned_day"
        defaultValue={currentDay ?? ""}
        onChange={() => formRef.current?.requestSubmit()}
        aria-label="Set weekly meeting day"
        className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-colors"
      >
        <option value="">Set day…</option>
        {WEEKDAYS.map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>
    </form>
  );
}
