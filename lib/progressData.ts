import "server-only";

import { cache } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  buildStageMap,
  computePipelinePercent,
  type LanguageProgress,
  type ProjectProgress,
  type StageProgressRow,
} from "@/lib/progress";

interface LanguageRow {
  id: string;
  language: string;
  country: string;
  responsible_person: string | null;
  project_id: string | null;
  projects: { id: string; name: string } | null;
  stage_progress: StageProgressRow[] | null;
}

function toLanguageProgress(row: LanguageRow): LanguageProgress {
  const stages = buildStageMap(row.stage_progress);
  return {
    languageId: row.id,
    language: row.language,
    country: row.country,
    responsiblePerson: row.responsible_person,
    projectId: row.project_id,
    projectName: row.projects?.name ?? null,
    stages,
    pipelinePercent: computePipelinePercent(stages),
    finishedParas: stages.final_proof_reading.current_para,
  };
}

const LANGUAGE_SELECT = `
  id,
  language,
  country,
  responsible_person,
  project_id,
  projects:project_id ( id, name ),
  stage_progress ( stage, current_para, since_date, notes, updated_at )
`;

/**
 * The full progress board: in-progress languages grouped by project.
 * Consistent with the rest of the app, only `in_progress` languages appear.
 */
export const getCachedProgressBoard = cache(async (): Promise<ProjectProgress[]> => {
  const { data, error } = await supabase
    .from("languages")
    .select(LANGUAGE_SELECT)
    .eq("work_status", "in_progress")
    .order("language", { ascending: true });

  if (error) throw error;

  const groups = new Map<string, ProjectProgress>();
  const UNASSIGNED = "__unassigned__";

  for (const row of (data ?? []) as unknown as LanguageRow[]) {
    const lang = toLanguageProgress(row);
    const key = lang.projectId ?? UNASSIGNED;
    if (!groups.has(key)) {
      groups.set(key, {
        projectId: key,
        projectName: lang.projectName ?? "Unassigned",
        languages: [],
      });
    }
    groups.get(key)!.languages.push(lang);
  }

  // Sort: named projects alphabetically, "Unassigned" last.
  return Array.from(groups.values()).sort((a, b) => {
    if (a.projectId === UNASSIGNED) return 1;
    if (b.projectId === UNASSIGNED) return -1;
    return a.projectName.localeCompare(b.projectName);
  });
});

/** Single language's progress (for the edit page). Returns null if not found. */
export const getCachedLanguageProgress = cache(
  async (languageId: string): Promise<LanguageProgress | null> => {
    const { data, error } = await supabase
      .from("languages")
      .select(LANGUAGE_SELECT)
      .eq("id", languageId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return toLanguageProgress(data as unknown as LanguageRow);
  }
);
