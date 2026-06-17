"use server";

import { upsertStageProgress } from "@/lib/mutations";
import { requireStaff } from "@/lib/auth";
import { clampPara, ALL_STAGE_KEYS } from "@/lib/progress";
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

  // Only persist the stages this language's pipeline actually submitted
  // (Braille, for example, has its own set of stages).
  const submittedStages = ALL_STAGE_KEYS.filter((stage) =>
    formData.has(`para_${stage}`)
  );

  const entries = submittedStages.map((stage) => {
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

  if (entries.length === 0) {
    return { error: "No progress data submitted." };
  }

  // Ordering rule: Translation and Comparison are the "first-most" stages.
  //  1. Comparison can't be ahead of Translation (translate before you compare).
  //  2. No other stage can be ahead of Translation or Comparison.
  // Every remaining stage has no order between the others — they move freely.
  const paraByStage = Object.fromEntries(
    entries.map((e) => [e.stage, e.current_para])
  ) as Partial<Record<string, number>>;

  const label = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const translation = paraByStage.translation ?? 0;
  const comparison = paraByStage.comparison ?? 0;

  if (comparison > translation) {
    return {
      error: `"Comparison" cannot be ahead of "Translation". A para must be translated before it can be compared.`,
    };
  }

  // Translation & Comparison gate every other stage (the smaller of the two binds).
  const gate = Math.min(translation, comparison);
  for (const e of entries) {
    if (e.stage !== "translation" && e.stage !== "comparison" && e.current_para > gate) {
      return {
        error: `"${label(e.stage)}" cannot be ahead of Translation or Comparison — those two stages must come first.`,
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
