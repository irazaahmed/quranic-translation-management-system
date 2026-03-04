"use server";

import { updateLanguage, deleteLanguage as deleteLanguageDb } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface FormState {
  error?: string;
  success?: boolean;
}

export async function updateLanguageAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const languageId = formData.get("language_id") as string;
  const country = formData.get("country") as string;
  const language = formData.get("language") as string;
  const responsible_person = formData.get("responsible_person") as string;
  const priority = formData.get("priority") as "low" | "medium" | "high";

  // Validation
  if (!country || !country.trim()) {
    return { error: "Country is required" };
  }

  if (!language || !language.trim()) {
    return { error: "Language is required" };
  }

  try {
    await updateLanguage(languageId, {
      country: country.trim(),
      language: language.trim(),
      responsible_person: responsible_person.trim() || null,
      priority: priority || null,
    });

    revalidatePath("/languages");
    revalidatePath(`/languages/${languageId}`);
  } catch (error) {
    console.error("Failed to update language:", error);
    return { error: "Failed to update language. Please try again." };
  }

  redirect(`/languages/${languageId}`);
}

export async function deleteLanguageAction(languageId: string): Promise<{ error?: string }> {
  try {
    await deleteLanguageDb(languageId);
    revalidatePath("/languages");
    return {};
  } catch (error) {
    console.error("Failed to delete language:", error);
    return { error: "Failed to delete language. Please try again." };
  }
}
