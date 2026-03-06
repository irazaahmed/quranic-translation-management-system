"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { LanguageWithProject, Project } from "@/lib/supabase";
import LanguageActions from "./LanguageActions";

function formatDate(dateString: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getPriorityColor(priority: string | null): string {
  switch (priority) {
    case "high":
      return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
    case "medium":
      return "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400";
    case "low":
      return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
  }
}

function getWorkStatusBadge(status: string): { className: string; label: string } {
  switch (status) {
    case "in_progress":
      return { className: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400", label: "In Progress" };
    case "completed":
      return { className: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400", label: "Completed" };
    case "not_started":
    default:
      return { className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400", label: "Not Started Yet" };
  }
}

interface LanguagesListProps {
  initialLanguages: LanguageWithProject[];
  projects: Project[];
}

export default function LanguagesList({ initialLanguages, projects }: LanguagesListProps) {
  const [languages, setLanguages] = useState(initialLanguages);
  const [selectedProject, setSelectedProject] = useState<string>("all");

  const handleDelete = (deletedId: string) => {
    setLanguages(languages.filter((lang) => lang.id !== deletedId));
  };

  // Filter languages by project
  const filteredLanguages = useMemo(() => {
    if (selectedProject === "all") {
      return languages;
    }
    return languages.filter((lang) => lang.project?.id === selectedProject);
  }, [languages, selectedProject]);

  if (languages.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center transition-colors duration-200">
        <div>
          <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">No languages yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            Get started by adding your first language to track meetings.
          </p>
          <Link
            href="/languages/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add First Language
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Project Filter */}
      {projects.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <label htmlFor="project_filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Filter by Project:
            </label>
            <select
              id="project_filter"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {selectedProject !== "all" && (
              <button
                onClick={() => setSelectedProject("all")}
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200"
              >
                Clear filter
              </button>
            )}
          </div>
          {selectedProject !== "all" && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredLanguages.length} of {languages.length} languages
            </p>
          )}
        </div>
      )}

      {/* Desktop/Tablet Table View with horizontal scroll - hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-200">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
            <tr>
              <th scope="col" className="px-3 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200 whitespace-nowrap">
                Project
              </th>
              <th scope="col" className="px-3 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200 whitespace-nowrap">
                Language
              </th>
              <th scope="col" className="px-3 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200 whitespace-nowrap">
                Country
              </th>
              <th scope="col" className="px-3 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200 whitespace-nowrap max-w-[100px] lg:max-w-none truncate">
                Responsible
              </th>
              <th scope="col" className="px-3 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200 whitespace-nowrap">
                Priority
              </th>
              <th scope="col" className="px-3 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200 whitespace-nowrap">
                Status
              </th>
              <th scope="col" className="px-3 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200 whitespace-nowrap">
                Last Meeting
              </th>
              <th scope="col" className="px-3 lg:px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 transition-colors duration-200">
            {filteredLanguages.map((lang) => (
              <tr
                key={lang.id}
                className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {lang.project?.name || "—"}
                  </span>
                </td>
                <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                  <Link href={`/languages/${lang.id}`}>
                    <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                      {lang.language}
                    </div>
                  </Link>
                </td>
                <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                  <Link href={`/languages/${lang.id}`}>
                    <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                      {lang.country}
                    </div>
                  </Link>
                </td>
                <td className="px-3 lg:px-4 py-3 whitespace-nowrap max-w-[80px] lg:max-w-none">
                  <Link href={`/languages/${lang.id}`}>
                    <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200 truncate">
                      {lang.responsible_person || "—"}
                    </div>
                  </Link>
                </td>
                <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                  <Link href={`/languages/${lang.id}`}>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize transition-colors duration-200 ${getPriorityColor(lang.priority)}`}>
                      {lang.priority || "Not set"}
                    </span>
                  </Link>
                </td>
                <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                  <Link href={`/languages/${lang.id}`}>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize transition-colors duration-200 ${getWorkStatusBadge(lang.work_status).className}`}>
                      {getWorkStatusBadge(lang.work_status).label}
                    </span>
                  </Link>
                </td>
                <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                  <Link href={`/languages/${lang.id}`}>
                    <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                      {formatDate(lang.last_meeting_at)}
                    </div>
                  </Link>
                </td>
                <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-right">
                  <LanguageActions
                    languageId={lang.id}
                    languageName={`${lang.language} (${lang.country})`}
                    onDelete={() => handleDelete(lang.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - visible on screens below 640px */}
      <div className="sm:hidden grid gap-3">
        {filteredLanguages.map((lang) => (
          <div
            key={lang.id}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Project Name */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {lang.project?.name}
                </p>
                {/* Language Name & Country */}
                <div className="mb-3">
                  <Link href={`/languages/${lang.id}`}>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200">
                      {lang.language}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {lang.country}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Responsible Person */}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Responsible</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {lang.responsible_person || "—"}
                    </p>
                  </div>

                  {/* Priority */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Priority</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(lang.priority)}`}>
                      {lang.priority || "Not set"}
                    </span>
                  </div>

                  {/* Work Status */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Status</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getWorkStatusBadge(lang.work_status).className}`}>
                      {getWorkStatusBadge(lang.work_status).label}
                    </span>
                  </div>

                  {/* Last Meeting */}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Last Meeting</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {formatDate(lang.last_meeting_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0">
                <LanguageActions
                  languageId={lang.id}
                  languageName={`${lang.language} (${lang.country})`}
                  onDelete={() => handleDelete(lang.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state for filtered results */}
      {filteredLanguages.length === 0 && languages.length > 0 && (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center transition-colors duration-200">
          <div>
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">No languages for this project</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              Try selecting a different project or add a language to this project.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
