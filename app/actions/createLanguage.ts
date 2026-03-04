"use server";

import { createLanguage } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface FormState {
  error?: string;
  success?: boolean;
}

export async function createLanguageAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
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
    await createLanguage({
      country: country.trim(),
      language: language.trim(),
      responsible_person: responsible_person.trim() || null,
      priority: priority || null,
    });

    revalidatePath("/languages");
  } catch (error) {
    console.error("Failed to create language:", error);
    return { error: "Failed to create language. Please try again." };
  }

  redirect("/languages");
}
