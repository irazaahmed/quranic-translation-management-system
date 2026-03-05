import DashboardLayout from "@/components/DashboardLayout";
import { getAllLanguages } from "@/lib/supabase";
import Link from "next/link";
import LanguagesList from "./LanguagesList";

// Force dynamic rendering to prevent stale data
export const dynamic = "force-dynamic";

export default async function LanguagesPage() {
  let languages: Awaited<ReturnType<typeof getAllLanguages>> = [];
  let error: string | null = null;

  try {
    languages = await getAllLanguages();
  } catch (err) {
    console.error("Failed to fetch languages:", err);
    error = "Failed to load languages";
  }

  return (
    <DashboardLayout>
      {/* Page Header - optimized for small laptops */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200 truncate">All Languages</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Manage and track translation meetings across all languages
            </p>
          </div>
          <Link
            href="/languages/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 sm:px-4 lg:px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200 whitespace-nowrap flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden lg:inline">Add Language</span>
            <span className="hidden sm:inline lg:hidden">Language</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
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

      {/* Languages List */}
      <LanguagesList initialLanguages={languages} />
    </DashboardLayout>
  );
}
