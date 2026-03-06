import Link from "next/link";
import { getAllProjects } from "@/lib/supabase";
import LanguageForm from "./LanguageForm";

// Force dynamic rendering to prevent stale data
export const dynamic = "force-dynamic";

export default async function NewLanguagePage() {
  let projects: Awaited<ReturnType<typeof getAllProjects>> = [];
  let error: string | null = null;

  try {
    projects = await getAllProjects();
  } catch (err) {
    console.error("Failed to fetch projects:", err);
    error = "Failed to load projects";
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link
            href="/languages"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Languages
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
            Add New Language
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            Fill in the details to add a new language for meeting tracking
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-300 transition-colors duration-200">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <LanguageForm projects={projects} />
      </main>
    </div>
  );
}
