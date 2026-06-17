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

  // Ordering rule: Translation and Comparison are the "first-most" stages.
  //  1. Comparison can't be ahead of Translation (translate before you compare).
  //  2. No other stage can be ahead of Translation or Comparison.
  // The remaining stages (Formation, Tafteesh, Designing, Final Proof Reading)
  // have no order between themselves — they may move back and forth freely.
  const paraByStage = Object.fromEntries(
    entries.map((e) => [e.stage, e.current_para])
  ) as Record<(typeof STAGE_KEYS)[number], number>;

  const label = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (paraByStage.comparison > paraByStage.translation) {
    return {
      error: `"Comparison" cannot be ahead of "Translation". A para must be translated before it can be compared.`,
    };
  }

  // Translation & Comparison gate every other stage (the smaller of the two binds).
  const gate = Math.min(paraByStage.translation, paraByStage.comparison);
  const gatedStages = STAGE_KEYS.filter(
    (s) => s !== "translation" && s !== "comparison"
  );
  for (const stage of gatedStages) {
    if (paraByStage[stage] > gate) {
      return {
        error: `"${label(stage)}" cannot be ahead of Translation or Comparison — those two stages must come first.`,
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
