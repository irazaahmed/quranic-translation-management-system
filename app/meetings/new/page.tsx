import DashboardLayout from "@/components/DashboardLayout";
import { getAllLanguages } from "@/lib/supabase";
import QuickMeetingForm from "./QuickMeetingForm";
import Link from "next/link";

export default async function NewMeetingPage() {
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
          Record a meeting for any language quickly
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

      {/* Empty State - No Languages */}
      {languages.length === 0 && !error ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center transition-colors duration-200">
          <div>
            <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">No languages available</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              You need to add at least one language before creating a meeting.
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
      ) : (
        <QuickMeetingForm languages={languages} />
      )}
    </DashboardLayout>
  );
}
