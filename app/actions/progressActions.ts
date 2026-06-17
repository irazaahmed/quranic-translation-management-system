"use server";

import { upsertStageProgress } from "@/lib/mutations";
import { requireStaff } from "@/lib/auth";
import { clampPara, STAGE_KEYS } from "@/lib/progress";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface ProgressFormState {
  error?: string;
  success?: boolean;
}

export async function updateProgressAction(
  prevState: ProgressFormState,
  formData: FormData
): Promise<ProgressFormState> {
  const languageId = formData.get("language_id") as string;

  if (!languageId) {
    return { error: "Missing language reference." };
  }

  const entries = STAGE_KEYS.map((stage) => {
    const rawPara = Number(formData.get(`para_${stage}`));
    const since = (formData.get(`since_${stage}`) as string)?.trim();
    const notes = (formData.get(`notes_${stage}`) as string)?.trim();
    return {
      stage,
      current_para: clampPara(rawPara),
      since_date: since || null,
      notes: notes || null,
    };
  });

  // Enforce the forward-flow invariant: a later stage can't exceed an earlier
  // one (you can't compare a para you haven't translated, etc.).
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].current_para > entries[i - 1].current_para) {
      return {
        error: `"${STAGE_KEYS[i].replace(/_/g, " ")}" cannot be ahead of the previous stage. Each stage must be less than or equal to the one before it.`,
      };
    }
  }

  try {
    await requireStaff();
    await upsertStageProgress(languageId, entries);

    revalidatePath("/progress");
    revalidatePath(`/progress/${languageId}`);
    revalidatePath(`/languages/${languageId}`);
  } catch (error) {
    console.error("Failed to update progress:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "You don't have permission to edit progress." };
    }
    return { error: "Failed to save progress. Please try again." };
  }

  redirect("/progress");
}
