"use client";

import { useState } from "react";

interface ReportMeeting {
  id: string;
  meeting_date: string;
  discussion_points: string | null;
  action_items: string | null;
}

interface ReportLanguageGroup {
  language: { id: string; language: string; country: string };
  meetings: ReportMeeting[];
}

interface ReportActionsProps {
  title: string;
  periodLabel: string;
  totalMeetings: number;
  totalLanguages: number;
  languagesWithMeetings: ReportLanguageGroup[];
  /** filename without extension */
  fileBase: string;
}

function fmt(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function csvEscape(value: string): string {
  const v = value ?? "";
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export default function ReportActions({
  title,
  periodLabel,
  totalMeetings,
  totalLanguages,
  languagesWithMeetings,
  fileBase,
}: ReportActionsProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const buildText = (): string => {
    let text = `${title}\n${periodLabel}\n`;
    text += `Total Meetings: ${totalMeetings}\n`;
    text += `Total Languages: ${totalLanguages}\n\n`;
    languagesWithMeetings.forEach(({ language, meetings }) => {
      text += `${language.language} (${language.country})\n`;
      text += "-".repeat(40) + "\n";
      meetings.forEach((m) => {
        text += `Meeting Date: ${fmt(m.meeting_date)}\n`;
        if (m.discussion_points) text += `Discussion: ${m.discussion_points}\n`;
        if (m.action_items) text += `Next Action: ${m.action_items}\n`;
        text += "\n";
      });
      text += "\n";
    });
    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildText());
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  const handleCsv = () => {
    const rows: string[] = [
      ["Project Period", "Language", "Country", "Meeting Date", "Discussion Points", "Next Action"]
        .map(csvEscape)
        .join(","),
    ];
    languagesWithMeetings.forEach(({ language, meetings }) => {
      meetings.forEach((m) => {
        rows.push(
          [
            periodLabel,
            language.language,
            language.country,
            fmt(m.meeting_date),
            m.discussion_points || "",
            m.action_items || "",
          ]
            .map(csvEscape)
            .join(",")
        );
      });
    });
    const csv = rows.join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileBase}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
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
            Copy
          </>
        )}
      </button>

      <button
        onClick={handleCsv}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Excel/CSV
      </button>

      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print / PDF
      </button>
    </div>
  );
}
