import DashboardLayout from "@/components/DashboardLayout";
import SummaryCard from "@/components/SummaryCard";
import { getAllLanguages, getAllMeetings, getStaleLanguages, getLanguageById, getLanguagesNoMeeting } from "@/lib/supabase";
import RecentMeetings from "./dashboard/RecentMeetings";
import LanguagesNeedingAttention from "./dashboard/LanguagesNeedingAttention";
import UrgentFollowUps from "./dashboard/UrgentFollowUps";
import HighPriorityLanguages from "./dashboard/HighPriorityLanguages";
import ReportsDropdown from "./dashboard/ReportsDropdown";
import Link from "next/link";

function calculateStats(languages: any[]) {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const stats = {
    totalLanguages: languages.length,
    hasMeetingThisWeek: 0,
    noMeeting3Days: 0,
    highPriority: 0,
    mediumPriority: 0,
    completed: 0,
    notStarted: 0,
  };

  languages.forEach((lang) => {
    const lastMeeting = lang.last_meeting_at ? new Date(lang.last_meeting_at) : null;

    if (lastMeeting && lastMeeting >= sevenDaysAgo) {
      stats.hasMeetingThisWeek++;
    }

    if (!lastMeeting || lastMeeting < threeDaysAgo) {
      stats.noMeeting3Days++;
    }

    if (lang.priority === "high") {
      stats.highPriority++;
    }
    if (lang.priority === "medium") {
      stats.mediumPriority++;
    }
    if (lang.work_status === "completed") {
      stats.completed++;
    }
    if (lang.work_status === "not_started") {
      stats.notStarted++;
    }
  });

  return stats;
}

export default async function Dashboard() {
  let languages: any[] = [];
  let meetings: any[] = [];
  let staleLanguages: any[] = [];
  let urgentLanguages: any[] = [];
  let highPriorityLanguages: any[] = [];
  let stats: ReturnType<typeof calculateStats> | null = null;
  let error: string | null = null;

  try {
    // Fetch all data in parallel
    const [languagesData, meetingsData, staleData, urgentData] = await Promise.all([
      getAllLanguages(),
      getAllMeetings(),
      getStaleLanguages(3),
      getLanguagesNoMeeting(7),
    ]);

    languages = languagesData;
    meetings = meetingsData;
    staleLanguages = staleData;
    urgentLanguages = urgentData;
    highPriorityLanguages = languages.filter((lang) => lang.priority === "high");
    stats = calculateStats(languages);
  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
    error = "Failed to load dashboard data";
  }

  const displayStats = stats || {
    totalLanguages: 0,
    hasMeetingThisWeek: 0,
    noMeeting3Days: 0,
    highPriority: 0,
    mediumPriority: 0,
    completed: 0,
    notStarted: 0,
  };

  // Enrich meetings with language data
  const meetingsWithLanguage = await Promise.all(
    meetings.slice(0, 5).map(async (meeting) => ({
      meeting,
      language: await getLanguageById(meeting.language_id),
    }))
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200 truncate">Dashboard</h1>
            <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Overview of language meeting tracking status
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
            <ReportsDropdown />
            <Link
              href="/languages/new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 sm:px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Language</span>
              <span className="sm:hidden">Language</span>
            </Link>
            <Link
              href="/meetings/new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 sm:px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Quick Meeting</span>
              <span className="sm:hidden">Meeting</span>
            </Link>
          </div>
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

      {/* Empty State */}
      {displayStats.totalLanguages === 0 && !error ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center transition-colors duration-200">
          <div>
            <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">No languages yet</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              Get started by adding your first language to track meetings.
            </p>
            <a
              href="/languages/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Language
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
            <SummaryCard
              title="Total Languages"
              value={displayStats.totalLanguages}
              color="emerald"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              }
              trend={{ value: "languages tracked", label: "" }}
            />

            <SummaryCard
              title="In Progress"
              value={displayStats.totalLanguages - displayStats.completed - displayStats.notStarted}
              color="blue"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              trend={{ value: "active work", label: "" }}
            />

            <SummaryCard
              title="Completed"
              value={displayStats.completed}
              color="green"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              trend={{ value: "finished", label: "" }}
            />

            <SummaryCard
              title="Not Started"
              value={displayStats.notStarted}
              color="gray"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              trend={{ value: "pending", label: "" }}
            />

            <SummaryCard
              title="Meeting This Week"
              value={displayStats.hasMeetingThisWeek}
              color="blue"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              trend={{ value: "last 7 days", label: "" }}
            />

            <SummaryCard
              title="No Meeting 3+ Days"
              value={displayStats.noMeeting3Days}
              color="amber"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              trend={{ value: "needs attention", label: "" }}
            />

            <SummaryCard
              title="High Priority"
              value={displayStats.highPriority}
              color="purple"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
              }
              trend={{ value: "priority languages", label: "" }}
            />
          </div>

          {/* Main Dashboard Grid */}
          <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Recent Meetings - Left side (2 columns) */}
            <div className="lg:col-span-2">
              <RecentMeetings meetings={meetingsWithLanguage} />
            </div>

            {/* Languages Needing Attention - Right side (1 column) */}
            <div>
              <LanguagesNeedingAttention languages={staleLanguages} />
            </div>
          </div>

          {/* Urgent Follow-ups - Full width */}
          <div className="mt-4 sm:mt-6">
            <UrgentFollowUps languages={urgentLanguages} />
          </div>

          {/* High Priority Languages - Full width below */}
          <div className="mt-4 sm:mt-6">
            <HighPriorityLanguages languages={highPriorityLanguages} />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
