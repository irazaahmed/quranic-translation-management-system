"use server";

import { setAssignedDay } from "@/lib/mutations";
import { requireStaff } from "@/lib/auth";
import { WEEKDAYS } from "@/lib/schedule";
import { revalidatePath } from "next/cache";

export interface ScheduleActionState {
  error?: string;
  success?: boolean;
}

/**
 * Set (or clear) a language's weekly meeting day from the Schedule page.
 * An empty value clears the assignment (unscheduled).
 */
export async function setAssignedDayAction(
  prevState: ScheduleActionState,
  formData: FormData
): Promise<ScheduleActionState> {
  const languageId = formData.get("language_id") as string;
  const rawDay = (formData.get("assigned_day") as string)?.trim() || "";

  if (!languageId) {
    return { error: "Missing language." };
  }

  const day = rawDay && WEEKDAYS.includes(rawDay as never) ? rawDay : null;

  try {
    await requireStaff();
    await setAssignedDay(languageId, day);

    revalidatePath("/");
    revalidatePath("/schedule");
    revalidatePath("/languages");
    return { success: true };
  } catch (error) {
    console.error("Failed to set assigned day:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "You don't have permission to change the schedule." };
    }
    return { error: "Failed to update the schedule. Please try again." };
  }
}
