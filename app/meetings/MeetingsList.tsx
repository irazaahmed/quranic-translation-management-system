"use client";

import { useState, useTransition } from "react";
import { searchMeetings, MeetingWithLanguage } from "@/lib/supabase";
import Link from "next/link";

interface MeetingsListProps {
  initialMeetings: MeetingWithLanguage[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function truncateText(text: string | null, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export default function MeetingsList({ initialMeetings }: MeetingsListProps) {
  const [meetings, setMeetings] = useState<MeetingWithLanguage[]>(initialMeetings);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setMeetings(initialMeetings);
      return;
    }

    startTransition(() => {
      searchMeetings(query.trim()).then((results) => {
        setMeetings(results);
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search meetings by participants, discussion points, or language..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-200"
        />
        {isPending && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <svg className="h-5 w-5 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
          {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"} found
        </p>
        {searchQuery && (
          <button
            onClick={() => handleSearch("")}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center transition-colors duration-200">
          <div>
            <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
              {searchQuery ? "No meetings found" : "No meetings yet"}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              {searchQuery
                ? `No meetings match "${searchQuery}"`
                : "Start by creating your first meeting"}
            </p>
            {!searchQuery && (
              <Link
                href="/meetings/new"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Meeting
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {meetings.map(({ meeting, language }) => (
            <Link
              key={meeting.id}
              href={`/languages/${meeting.language_id}`}
              className="block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20 transition-colors duration-200">
                      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                        {language?.language || "Unknown Language"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                        {language?.country} • {formatDate(meeting.meeting_date)}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-4 space-y-3">
                    {/* Participants */}
                    {meeting.participants && (
                      <div className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Participants:</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">{meeting.participants}</p>
                        </div>
                      </div>
                    )}

                    {/* Discussion Points */}
                    {meeting.discussion_points && (
                      <div className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Discussion:</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
                            {truncateText(meeting.discussion_points, 200)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Next Action */}
                    {meeting.action_items && (
                      <div className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Next Action:</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
                            {truncateText(meeting.action_items, 200)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
