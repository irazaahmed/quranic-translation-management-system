"use client";

import { useState } from "react";
import { MonthlyReportData } from "@/lib/supabase";

interface MonthlyReportContentProps {
  report: MonthlyReportData;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatReportDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MonthlyReportContent({ report }: MonthlyReportContentProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const generateReportText = (): string => {
    let text = "Monthly Meeting Summary\n";
    text += `${formatReportDate(report.monthStart)} - ${formatReportDate(report.monthEnd)}\n`;
    text += `Total Meetings: ${report.totalMeetings}\n`;
    text += `Total Languages: ${report.totalLanguages}\n\n`;

    report.languagesWithMeetings.forEach(({ language, meetings }) => {
      text += `${language.language} (${language.country})\n`;
      text += "─".repeat(40) + "\n";

      meetings.forEach((meeting) => {
        text += `Meeting Date: ${formatDate(meeting.meeting_date)}\n`;

        if (meeting.discussion_points) {
          text += `Discussion: ${meeting.discussion_points}\n`;
        }

        if (meeting.action_items) {
          text += `Next Action: ${meeting.action_items}\n`;
        }

        text += "\n";
      });

      text += "\n";
    });

    return text;
  };

  const handleCopy = async () => {
    try {
      const reportText = generateReportText();
      await navigator.clipboard.writeText(reportText);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy report:", err);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  if (report.totalMeetings === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center transition-colors duration-200">
        <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">No meetings this month</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
          There are no meetings recorded in the past 30 days.
        </p>
        <a
          href="/meetings/new"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Meeting
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header Stats */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 transition-colors duration-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
              {report.monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              {formatReportDate(report.monthStart)} - {formatReportDate(report.monthEnd)}
            </p>
            <div className="mt-2 flex gap-6">
              <div>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 transition-colors duration-200">{report.totalMeetings}</span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Meetings</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-200">{report.totalLanguages}</span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Languages</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            disabled={copyStatus === "copied"}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
              copyStatus === "copied"
                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {copyStatus === "copied" ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Content - Languages */}
      <div className="space-y-6">
        {report.languagesWithMeetings.map(({ language, meetings }) => (
          <div key={language.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-200">
            {/* Language Header */}
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20 transition-colors duration-200">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                    {language.language}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{language.country}</p>
                </div>
                <span className="ml-auto inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/20 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition-colors duration-200">
                  {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"}
                </span>
              </div>
            </div>

            {/* Meetings List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{formatDate(meeting.meeting_date)}</span>
                  </div>

                  <div className="space-y-3">
                    {meeting.discussion_points && (
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Discussion Points</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap transition-colors duration-200">
                          {meeting.discussion_points}
                        </p>
                      </div>
                    )}

                    {meeting.action_items && (
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Next Action</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap transition-colors duration-200">
                          {meeting.action_items}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
