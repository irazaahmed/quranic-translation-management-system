"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function WeeklyReportPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">Weekly Report</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
          View weekly translation progress and updates
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-colors duration-200">
        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
          Weekly report data will be displayed here.
        </p>
      </div>
    </DashboardLayout>
  );
}
