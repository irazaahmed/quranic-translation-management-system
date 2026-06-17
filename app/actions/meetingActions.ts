"use server";

import { updateMeeting, deleteMeeting as deleteMeetingDb } from "@/lib/mutations";
import { requireStaff } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface FormState {
  error?: string;
  success?: boolean;
}

export async function updateMeetingAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const meetingId = formData.get("meeting_id") as string;
  const languageId = formData.get("language_id") as string;
  const meetingDate = formData.get("meeting_date") as string;
  const participants = formData.get("participants") as string;
  const discussionPoints = formData.get("discussion_points") as string;
  const actionItems = formData.get("action_items") as string;
  const nextMeetingDate = formData.get("next_meeting_date") as string;

  // Validation
  if (!meetingDate || !meetingDate.trim()) {
    return { error: "Meeting date is required" };
  }

  try {
    await requireStaff();

    await updateMeeting(meetingId, {
      meeting_date: meetingDate.trim(),
      participants: participants.trim() || null,
      discussion_points: discussionPoints.trim() || null,
      action_items: actionItems.trim() || null,
      next_meeting_date: nextMeetingDate?.trim() ? nextMeetingDate.trim() : null,
    });

    revalidatePath("/");
    revalidatePath("/languages");
    revalidatePath("/schedule");
    revalidatePath(`/languages/${languageId}`);
  } catch (error) {
    console.error("Failed to update meeting:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "You don't have permission to edit meetings." };
    }
    return { error: "Failed to update meeting. Please try again." };
  }

  redirect(`/languages/${languageId}`);
}

export async function deleteMeetingAction(meetingId: string, languageId: string): Promise<{ error?: string }> {
  try {
    await requireStaff();

    await deleteMeetingDb(meetingId);
    revalidatePath("/languages");
    revalidatePath(`/languages/${languageId}`);
    return {};
  } catch (error) {
    console.error("Failed to delete meeting:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "You don't have permission to delete meetings." };
    }
    return { error: "Failed to delete meeting. Please try again." };
  }
}
