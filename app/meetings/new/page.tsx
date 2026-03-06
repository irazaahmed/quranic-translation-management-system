import DashboardLayout from "@/components/DashboardLayout";
import { getAllProjects, Project } from "@/lib/supabase";
import QuickMeetingForm from "./QuickMeetingForm";
import Link from "next/link";

export default async function NewMeetingPage() {
  let error: string | null = null;
  let projectsPromise: Promise<Project[]> = Promise.resolve([]);

  try {
    projectsPromise = getAllProjects();
  } catch (err) {
    console.error("Failed to fetch projects:", err);
    error = "Failed to load projects";
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200">
            Dashboard
          </Link>
          <span className="text-gray-400 dark:text-gray-600 transition-colors duration-200">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium transition-colors duration-200">Quick Meeting</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
          Quick Meeting Entry
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
          Record a meeting for any language
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-400 transition-colors duration-200">{error}</p>
          </div>
        </div>
      )}

      <QuickMeetingForm projectsPromise={projectsPromise} />
    </DashboardLayout>
  );
}
