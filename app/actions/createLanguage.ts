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
  const work_status = formData.get("work_status") as "not_started" | "in_progress" | "completed";
  const project_id = formData.get("project_id") as string;

  // Validation
  if (!country || !country.trim()) {
    return { error: "Country is required" };
  }

  if (!language || !language.trim()) {
    return { error: "Language is required" };
  }

  if (!project_id || !project_id.trim()) {
    return { error: "Project is required" };
  }

  try {
    await createLanguage({
      country: country.trim(),
      language: language.trim(),
      responsible_person: responsible_person.trim() || null,
      priority: priority || null,
      work_status: work_status || 'not_started',
      project_id: project_id.trim(),
    });

    revalidatePath("/");
    revalidatePath("/languages");
    revalidatePath("/meetings");
  } catch (error) {
    console.error("Failed to create language:", error);
    if (error instanceof Error && error.message === "Language already exists for this project") {
      return { error: "This language already exists for the selected project" };
    }
    if (error instanceof Error && error.message === "Project is required") {
      return { error: "Project is required" };
    }
    return { error: "Failed to create language. Please try again." };
  }

  redirect("/languages");
}
