"use client";

import { useState } from "react";
import Link from "next/link";
import { Language } from "@/lib/supabase";
import LanguageActions from "./LanguageActions";

function formatDate(dateString: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getPriorityColor(priority: string | null): string {
  switch (priority) {
    case "high":
      return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
    case "medium":
      return "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400";
    case "low":
      return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
  }
}

interface LanguagesListProps {
  initialLanguages: Language[];
}

export default function LanguagesList({ initialLanguages }: LanguagesListProps) {
  const [languages, setLanguages] = useState(initialLanguages);

  const handleDelete = (deletedId: string) => {
    setLanguages(languages.filter((lang) => lang.id !== deletedId));
  };

  if (languages.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center transition-colors duration-200">
        <div>
          <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">No languages yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            Get started by adding your first language to track meetings.
          </p>
          <Link
            href="/languages/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add First Language
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-200">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
              Language
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
              Country
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
              Responsible Person
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
              Priority
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
              Last Meeting
            </th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 transition-colors duration-200">
          {languages.map((lang) => (
            <tr
              key={lang.id}
              className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/languages/${lang.id}`}>
                  <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                    {lang.language}
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/languages/${lang.id}`}>
                  <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                    {lang.country}
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/languages/${lang.id}`}>
                  <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                    {lang.responsible_person || "—"}
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/languages/${lang.id}`}>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize transition-colors duration-200 ${getPriorityColor(lang.priority)}`}>
                    {lang.priority || "Not set"}
                  </span>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/languages/${lang.id}`}>
                  <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                    {formatDate(lang.last_meeting_at)}
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <LanguageActions
                  languageId={lang.id}
                  languageName={`${lang.language} (${lang.country})`}
                  onDelete={() => handleDelete(lang.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
