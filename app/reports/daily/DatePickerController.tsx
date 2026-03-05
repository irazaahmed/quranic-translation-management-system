"use client";

import { useRouter } from "next/navigation";

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DatePickerController({ selectedDate }: { selectedDate: Date }) {
  const router = useRouter();

  return (
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
  );
}
