"use server";

import { createMeeting } from "@/lib/mutations";
import { requireStaff } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface FormState {
  error?: string;
  success?: boolean;
}

export async function createMeetingAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const languageId = formData.get("language_id") as string;
  const meetingDate = formData.get("meeting_date") as string;
  const participants = formData.get("participants") as string;
  const discussionPoints = formData.get("discussion_points") as string;
  const nextAction = formData.get("next_action") as string;

  // Validation
  if (!meetingDate) {
    return { error: "Meeting date is required" };
  }

  try {
    await requireStaff();

    await createMeeting({
      language_id: languageId,
      meeting_date: new Date(meetingDate).toISOString(),
      participants: participants.trim() || null,
      discussion_points: discussionPoints.trim() || null,
      action_items: nextAction.trim() || null,
    });

    revalidatePath("/");
    revalidatePath("/languages");
    revalidatePath("/meetings");
    revalidatePath(`/languages/${languageId}`);
  } catch (error) {
    console.error("Failed to create meeting:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "You don't have permission to add meetings." };
    }
    return { error: "Failed to create meeting. Please try again." };
  }

  redirect(`/languages/${languageId}`);
}
