import { Language } from "@/lib/supabase";
import Link from "next/link";

interface UrgentFollowUpsProps {
  languages: Language[];
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysSince(dateString: string | null): number | null {
  if (!dateString) return null;
  const lastMeeting = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - lastMeeting.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function UrgentFollowUps({ languages }: UrgentFollowUpsProps) {
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 sm:p-5 transition-colors duration-200">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 transition-colors duration-200 flex-shrink-0">
          <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-red-900 dark:text-red-300 transition-colors duration-200">Immediate Follow-up Required (7+ Days)</h3>
          <p className="text-xs text-red-700 dark:text-red-400 transition-colors duration-200">Languages requiring urgent review</p>
        </div>
      </div>

      {languages.length === 0 ? (
        <div className="rounded-lg border border-green-200 dark:border-green-900/50 bg-white dark:bg-green-900/10 p-3 sm:p-4 text-center transition-colors duration-200">
          <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-sm font-medium text-green-900 dark:text-green-300 transition-colors duration-200">
            All languages are actively being followed up.
          </p>
          <p className="text-xs text-green-700 dark:text-green-400 transition-colors duration-200">No languages with 7+ days without meetings</p>
        </div>
      ) : (
        <ul className="space-y-2 sm:space-y-3">
          {languages.slice(0, 5).map((lang) => {
            const daysSince = getDaysSince(lang.last_meeting_at);
            return (
              <li key={lang.id}>
                <Link
                  href={`/languages/${lang.id}`}
                  className="block rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-900 p-3 transition-all duration-200 hover:bg-red-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                          {lang.language}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                          {lang.country}
                        </span>
                      </div>
                      {lang.responsible_person && (
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">
                          <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Responsible:</span> {lang.responsible_person}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-red-700 dark:text-red-400 font-medium transition-colors duration-200">
                          Last meeting: {formatDate(lang.last_meeting_at)}
                        </span>
                        {daysSince !== null && (
                          <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-xs font-medium text-red-800 dark:text-red-300 transition-colors duration-200 whitespace-nowrap">
                            {daysSince} {daysSince === 1 ? "day" : "days"} ago
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
