"use client";

import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getDailyReport, getMeetingsByDateRange } from "@/lib/supabase";
import DailyReportContent from "./DailyReportContent";
import Link from "next/link";
import { Suspense, useState } from "react";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function DailyReportContentWrapper({ selectedDate }: { selectedDate: Date }) {
  const router = useRouter();

  return (
    <DailyReportContent
      report={{
        selectedDate,
        totalMeetings: 0,
        totalLanguages: 0,
        languagesWithMeetings: [],
      }}
    />
  );
}

function DatePicker({ 
  selectedDate, 
  startDate, 
  endDate, 
  hasActiveFilter 
}: { 
  selectedDate: Date; 
  startDate: string | null; 
  endDate: string | null;
  hasActiveFilter: boolean;
}) {
  const router = useRouter();

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const startOfMonth = new Date(today);
  startOfMonth.setDate(1);

  return (
    <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-200">
      {/* Date Range Filter Form */}
      <form
        action="/reports/daily"
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
            defaultValue={startDate || undefined}
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
            defaultValue={endDate || undefined}
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
              href="/reports/daily"
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
          href="/reports/daily"
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ${
            !hasActiveFilter
              ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          All Time
        </Link>
        <Link
          href="/reports/daily?startDate=&endDate="
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ${
            hasActiveFilter && startDate === ""
              ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Today
        </Link>
        <Link
          href={`/reports/daily?startDate=${formatDateForInput(startOfWeek)}&endDate=`}
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Last 7 Days
        </Link>
        <Link
          href={`/reports/daily?startDate=${formatDateForInput(startOfMonth)}&endDate=`}
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          This Month
        </Link>
      </div>

      {/* Single Date Picker */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 mb-2">
              Or select a specific date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              defaultValue={formatDateForInput(selectedDate)}
              onChange={(e) => {
                if (e.target.value) {
                  router.push(`/reports/daily?date=${e.target.value}`);
                }
              }}
              className="w-full sm:w-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <Link
              href={`/reports/daily?date=${formatDateForInput(yesterday)}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Yesterday</span>
              <span className="sm:hidden">Yesterday</span>
            </Link>
            <Link
              href="/reports/daily"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200 whitespace-nowrap"
            >
              Today
            </Link>
            <Link
              href={`/reports/daily?date=${formatDateForInput(tomorrow)}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Tomorrow</span>
              <span className="sm:hidden">Tomorrow</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DailyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; startDate?: string; endDate?: string }>;
}) {
  return (
    <Suspense fallback={<DashboardLayout><div className="p-8 text-center">Loading...</div></DashboardLayout>}>
      <DailyReportInner searchParams={searchParams} />
    </Suspense>
  );
}

async function DailyReportInner({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; startDate?: string; endDate?: string }>;
}) {
  const { date, startDate: startParam, endDate: endParam } = await searchParams;

  let selectedDate = new Date();
  let report: Awaited<ReturnType<typeof getDailyReport>> | { selectedDate: Date; totalMeetings: number; totalLanguages: number; languagesWithMeetings: { language: any; meetings: any[] }[] } | null = null;
  let error: string | null = null;
  let hasActiveFilter = false;

  try {
    // Check if date range filter is active
    if (startParam !== undefined || endParam !== undefined) {
      hasActiveFilter = true;
      
      // If both are empty strings, filter for today
      if (startParam === "" && endParam === "") {
        selectedDate = new Date();
        report = await getDailyReport(selectedDate);
      } else if (startParam || endParam) {
        // Use date range
        const startDate = startParam && startParam !== "" ? new Date(startParam) : new Date("2000-01-01");
        const endDate = endParam && endParam !== "" ? new Date(endParam) : new Date("2099-12-31");
        const rangeReport = await getMeetingsByDateRange(startDate, endDate);
        
        // Convert to DailyReportData format
        report = {
          selectedDate: new Date(),
          totalMeetings: rangeReport.totalMeetings,
          totalLanguages: rangeReport.totalLanguages,
          languagesWithMeetings: rangeReport.languagesWithMeetings,
        };
      }
    } else if (date) {
      // Single date filter
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        selectedDate = parsedDate;
      }
      report = await getDailyReport(selectedDate);
    } else {
      // No filter - show today
      report = await getDailyReport(selectedDate);
    }
  } catch (err) {
    console.error("Failed to fetch daily report:", err);
    error = "Failed to load daily report";
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        {/* Breadcrumb */}
        <nav className="mb-3 sm:mb-4 flex items-center gap-2 text-sm overflow-x-auto">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 whitespace-nowrap">
            Dashboard
          </Link>
          <span className="text-gray-400 dark:text-gray-600 transition-colors duration-200">/</span>
          <Link href="/reports/weekly" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 whitespace-nowrap">
            Reports
          </Link>
          <span className="text-gray-400 dark:text-gray-600 transition-colors duration-200">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium transition-colors duration-200 whitespace-nowrap">Daily Report</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 truncate">
              {hasActiveFilter ? "Meeting Report (Date Range)" : "Daily Meeting Report"}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
              {hasActiveFilter 
                ? "View meetings filtered by date range" 
                : date 
                  ? `View meetings for ${selectedDate.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                  : "View meetings for a specific date or date range"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {/* Report Type Tabs */}
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 transition-colors duration-200">
              <Link
                href="/reports/daily"
                className="rounded-md bg-emerald-100 dark:bg-emerald-900/20 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors duration-200 whitespace-nowrap"
              >
                Daily
              </Link>
              <Link
                href="/reports/weekly"
                className="rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 whitespace-nowrap"
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
      </div>

      {/* Date Picker */}
      <DatePicker 
        selectedDate={selectedDate} 
        startDate={startParam ?? null} 
        endDate={endParam ?? null}
        hasActiveFilter={hasActiveFilter}
      />

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

      {report && <DailyReportContent report={report as any} />}
    </DashboardLayout>
  );
}
