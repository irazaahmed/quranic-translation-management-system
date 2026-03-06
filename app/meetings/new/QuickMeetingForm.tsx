"use client";

import { useActionState, useState, useEffect, use } from "react";
import Link from "next/link";
import { createQuickMeetingAction, FormState } from "@/app/actions/createQuickMeeting";
import { getLanguagesByProject } from "@/lib/supabase";

interface LanguageOption {
  id: string;
  name: string;
  country: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

const initialState: FormState = {};

export default function QuickMeetingForm({
  projectsPromise,
}: {
  projectsPromise: Promise<ProjectOption[]>;
}) {
  const projects = use(projectsPromise);
  const [state, formAction, isPending] = useActionState(
    createQuickMeetingAction,
    initialState
  );

  const [selectedProject, setSelectedProject] = useState<string>("");
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);

  // Load languages when project changes
  useEffect(() => {
    if (!selectedProject) {
      setLanguages([]);
      return;
    }

    const loadLanguages = async () => {
      setIsLoadingLanguages(true);
      try {
        const langs = await getLanguagesByProject(selectedProject);
        setLanguages(
          langs.map((l) => ({
            id: l.id,
            name: l.language,
            country: l.country,
          }))
        );
      } catch (error) {
        console.error("Failed to load languages:", error);
        setLanguages([]);
      } finally {
        setIsLoadingLanguages(false);
      }
    };

    loadLanguages();
  }, [selectedProject]);

  return (
    <>
      {/* Error Message */}
      {state.error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 transition-colors duration-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300 transition-colors duration-200">{state.error}</p>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 transition-colors duration-200">
          <div className="grid gap-6">
            {/* Project Selection */}
            <div>
              <label
                htmlFor="project_id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
              >
                Project <span className="text-red-500">*</span>
              </label>
              <select
                id="project_id"
                name="project_id"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
              >
                <option value="">Select a project first</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            <div>
              <label
                htmlFor="language_id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
              >
                Language <span className="text-red-500">*</span>
              </label>
              {isLoadingLanguages ? (
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading languages...
                </div>
              ) : selectedProject && languages.length === 0 ? (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No languages available for this project. Add a language first.
                </p>
              ) : (
                <select
                  id="language_id"
                  name="language_id"
                  required
                  disabled={!selectedProject || languages.length === 0}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <option value="">Select a language</option>
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name} ({lang.country})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Meeting Date */}
            <div>
              <label
                htmlFor="meeting_date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
              >
                Meeting Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="meeting_date"
                name="meeting_date"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
              />
            </div>

            {/* Participants */}
            <div>
              <label
                htmlFor="participants"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
              >
                Participants
              </label>
              <input
                type="text"
                id="participants"
                name="participants"
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
                placeholder="e.g., Ahmed Ali, Fatima Khan, Zainab Hassan"
              />
            </div>

            {/* Discussion Points */}
            <div>
              <label
                htmlFor="discussion_points"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
              >
                Discussion Points
              </label>
              <textarea
                id="discussion_points"
                name="discussion_points"
                rows={6}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
                placeholder="Enter the main discussion points from the meeting..."
              />
            </div>

            {/* Next Action */}
            <div>
              <label
                htmlFor="next_action"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
              >
                Next Action
              </label>
              <textarea
                id="next_action"
                name="next_action"
                rows={4}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
                placeholder="Enter action items and next steps..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/"
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending || !selectedProject || languages.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isPending && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isPending ? "Saving..." : "Save Meeting"}
          </button>
        </div>
      </form>
    </>
  );
}
