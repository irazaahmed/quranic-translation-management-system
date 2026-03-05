import { Meeting, Language } from "@/lib/supabase";
import Link from "next/link";

interface RecentMeetingsProps {
  meetings: Array<{
    meeting: Meeting;
    language: Language | null;
  }>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncateText(text: string | null, maxLength: number): string {
  if (!text) return "No discussion points";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export default function RecentMeetings({ meetings }: RecentMeetingsProps) {
  if (meetings.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-5 transition-colors duration-200">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-200">Recent Meetings</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
          No meetings recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-5 transition-colors duration-200">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-200">Recent Meetings</h3>
        <Link href="/meetings" className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200 whitespace-nowrap">
          <span className="hidden sm:inline">View all meetings</span>
          <span className="sm:hidden">View all</span>
        </Link>
      </div>
      <ul className="space-y-3">
        {meetings.slice(0, 5).map(({ meeting, language }) => (
          <li key={meeting.id}>
            <Link
              href={`/languages/${meeting.language_id}`}
              className="block rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                      {language?.language || "Unknown Language"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      {language?.country || ""}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">{formatDate(meeting.meeting_date)}</span>
                  </div>
                  {meeting.participants && (
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Participants:</span> {meeting.participants}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 transition-colors duration-200">
                    {truncateText(meeting.discussion_points, 100)}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
