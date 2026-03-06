"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateLanguageAction, FormState } from "@/app/actions/languageActions";
import { Language, Project } from "@/lib/supabase";

interface EditLanguageFormProps {
  language: Language;
  projects: Project[];
}

const priorityOptions = [
  { value: "", label: "Select priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const workStatusOptions = [
  { value: "not_started", label: "Not Started Yet" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const initialState: FormState = {};

export default function EditLanguageForm({ language, projects }: EditLanguageFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateLanguageAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden field for language ID */}
      <input type="hidden" name="language_id" value={language.id} />

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-colors duration-200">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Project Selection */}
          <div className="sm:col-span-2">
            <label
              htmlFor="project_id"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
            >
              Project <span className="text-red-500">*</span>
            </label>
            <select
              id="project_id"
              name="project_id"
              required
              defaultValue={language.project_id || ""}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
            >
              <option value="">Select a project</option>
              {projects.length === 0 ? (
                <option value="" disabled>No projects available</option>
              ) : (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              )}
            </select>
            {projects.length === 0 && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                ⚠️ No projects found. Please add a project first.
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="country"
              name="country"
              required
              defaultValue={language.country}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
              placeholder="e.g., Pakistan"
            />
          </div>

          {/* Language */}
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
            >
              Language <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="language"
              name="language"
              required
              defaultValue={language.language}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
              placeholder="e.g., Urdu"
            />
          </div>

          {/* Responsible Person */}
          <div className="sm:col-span-2">
            <label
              htmlFor="responsible_person"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
            >
              Responsible Person
            </label>
            <input
              type="text"
              id="responsible_person"
              name="responsible_person"
              defaultValue={language.responsible_person || ""}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
              placeholder="e.g., Ahmed Ali"
            />
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue={language.priority || ""}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Work Status */}
          <div>
            <label
              htmlFor="work_status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
            >
              Work Status
            </label>
            <select
              id="work_status"
              name="work_status"
              defaultValue={language.work_status}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
            >
              {workStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 transition-colors duration-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-400 transition-colors duration-200">{state.error}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href={`/languages/${language.id}`}
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending || projects.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isPending && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
