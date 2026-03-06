"use server";

import { getAllProjects, getLanguagesByProject } from "@/lib/supabase";

export interface ProjectOption {
  id: string;
  name: string;
}

export async function getProjectsAction(): Promise<ProjectOption[]> {
  try {
    const projects = await getAllProjects();
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
    }));
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
}

export async function getLanguagesByProjectAction(projectId: string) {
  try {
    const languages = await getLanguagesByProject(projectId);
    return languages.map((l) => ({
      id: l.id,
      name: `${l.language} (${l.country})`,
    }));
  } catch (error) {
    console.error("Failed to fetch languages by project:", error);
    throw error;
  }
}
