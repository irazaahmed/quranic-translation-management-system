import DashboardLayout from "@/components/DashboardLayout";
import { getWeeklyReport } from "@/lib/supabase";
import WeeklyReportContent from "./WeeklyReportContent";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function WeeklyReportPage() {
  let report: Awaited<ReturnType<typeof getWeeklyReport>> | null = null;
  let error: string | null = null;

  try {
    report = await getWeeklyReport();
  } catch (err) {
    console.error("Failed to fetch weekly report:", err);
    error = "Failed to load weekly report";
  }

  return (
    <DashboardLayout>
      {/* Page Header - optimized for small laptops */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        {/* Breadcrumb */}
        <nav className="mb-2 sm:mb-3 flex items-center gap-2 text-sm overflow-x-auto">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 whitespace-nowrap">
            Dashboard
          </Link>
          <span className="text-gray-400 dark:text-gray-600 transition-colors duration-200">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium transition-colors duration-200 whitespace-nowrap">Weekly Report</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 truncate">
              Weekly Meeting Report
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Summary of all meetings from the past 7 days
            </p>
          </div>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 transition-colors duration-200 flex-shrink-0">
            <Link
              href="/reports/daily"
              className="rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 whitespace-nowrap"
            >
              Daily
            </Link>
            <Link
              href="/reports/weekly"
              className="rounded-md bg-emerald-100 dark:bg-emerald-900/20 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors duration-200 whitespace-nowrap"
            >
              Weekly
            </Link>
            <Link
              href="/reports/monthly"
              className="rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 whitespace-nowrap"
            >
              Monthly
            </Link>
          </div>
        </div>
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

      {report && <WeeklyReportContent report={report} />}
    </DashboardLayout>
  );
}
