import DashboardLayout from "@/components/DashboardLayout";
import { getLanguageById, getMeetingsByLanguage } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import MeetingCard from "./MeetingCard";

interface LanguageDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMeetingDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPriorityColor(priority: string | null): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-amber-100 text-amber-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default async function LanguageDetailPage({ params }: LanguageDetailPageProps) {
  const { id } = await params;
  
  let language: Awaited<ReturnType<typeof getLanguageById>> = null;
  let meetings: Awaited<ReturnType<typeof getMeetingsByLanguage>> = [];
  let error: string | null = null;

  try {
    language = await getLanguageById(id);
    if (!language) {
      notFound();
    }
    meetings = await getMeetingsByLanguage(id);
  } catch (err) {
    console.error("Failed to fetch language details:", err);
    error = "Failed to load language details";
  }

  if (!language) {
    notFound();
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm">
          <Link href="/languages" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200">
            Languages
          </Link>
          <span className="text-gray-400 dark:text-gray-600 transition-colors duration-200">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium transition-colors duration-200">{language.language}</span>
        </nav>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
              {language.language}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">{language.country}</p>
          </div>
          <Link
            href={`/languages/${id}/meetings/new`}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Meeting
          </Link>
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

      {/* Language Info Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Priority */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 dark:bg-gray-700 transition-colors duration-200 p-2">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Priority</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(language.priority)}`}>
                {language.priority || "Not set"}
              </span>
            </div>
          </div>
        </div>

        {/* Responsible Person */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 transition-colors duration-200 p-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Responsible Person</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                {language.responsible_person || "Not assigned"}
              </p>
            </div>
          </div>
        </div>

        {/* Last Meeting */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/20 transition-colors duration-200 p-2">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Last Meeting</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                {formatDate(language.last_meeting_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Meetings */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/20 transition-colors duration-200 p-2">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Total Meetings</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                {meetings.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting History */}
      <div className="mt-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">Meeting History</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200 mt-1">
            View all meetings for {language.language}
          </p>
        </div>

        {meetings.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h4 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">No meetings yet</h4>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              Start by adding the first meeting for this language.
            </p>
            <Link
              href={`/languages/${id}/meetings/new`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Meeting
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200 p-6">
            <div className="grid gap-6">
              {meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  formattedDate={formatMeetingDate(meeting.meeting_date)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
