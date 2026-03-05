import DashboardLayout from "@/components/DashboardLayout";
import { getAllMeetingsWithLanguage, getMeetingsByDateRangeWithLanguage } from "@/lib/supabase";
import MeetingsList from "./MeetingsList";
import Link from "next/link";

// Force dynamic rendering to prevent stale data
export const dynamic = "force-dynamic";

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const { startDate: startParam, endDate: endParam } = await searchParams;
  
  let initialMeetings: Awaited<ReturnType<typeof getAllMeetingsWithLanguage>> = [];
  let error: string | null = null;
  let hasActiveFilter = false;

  try {
    if (startParam || endParam) {
      hasActiveFilter = true;
      const startDate = startParam ? new Date(startParam) : new Date("2000-01-01");
      const endDate = endParam ? new Date(endParam) : new Date("2099-12-31");
      initialMeetings = await getMeetingsByDateRangeWithLanguage(startDate, endDate);
    } else {
      initialMeetings = await getAllMeetingsWithLanguage();
    }
  } catch (err) {
    console.error("Failed to fetch meetings:", err);
    error = "Failed to load meetings";
  }

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const startOfMonth = new Date(today);
  startOfMonth.setDate(1);

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        {/* Breadcrumb */}
        <nav className="mb-3 sm:mb-4 flex items-center gap-2 text-sm overflow-x-auto">
          <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 whitespace-nowrap">
            Dashboard
          </Link>
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <span className="text-gray-900 dark:text-white font-medium transition-colors duration-200 whitespace-nowrap">All Meetings</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200 truncate">
              All Meetings
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Search and browse all meeting records
            </p>
          </div>
          <Link
            href="/meetings/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 sm:px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200 whitespace-nowrap flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Meeting</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>

      {/* Date Filter */}
      <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-200">
        <form
          action="/meetings"
          method="GET"
          className="flex flex-col lg:flex-row gap-4"
        >
          <div className="flex-1">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              defaultValue={startParam}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              defaultValue={endParam}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
            />
          </div>
          <div className="flex items-end gap-2 flex-shrink-0 flex-wrap">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Filter
            </button>
            {hasActiveFilter && (
              <Link
                href="/meetings"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 whitespace-nowrap"
              >
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* Quick Filter Buttons */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Quick filters:</span>
          <Link
            href="/meetings"
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ${
              !hasActiveFilter
                ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All Time
          </Link>
          <Link
            href="/meetings?startDate=&endDate="
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ${
              hasActiveFilter && startParam === ""
                ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Today
          </Link>
          <Link
            href={`/meetings?startDate=${formatDateForInput(startOfWeek)}&endDate=`}
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Last 7 Days
          </Link>
          <Link
            href={`/meetings?startDate=${formatDateForInput(startOfMonth)}&endDate=`}
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            This Month
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

      <MeetingsList initialMeetings={initialMeetings} />
    </DashboardLayout>
  );
}
