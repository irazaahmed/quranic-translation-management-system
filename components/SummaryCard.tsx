interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    label: string;
  };
  color?: "emerald" | "blue" | "amber" | "purple" | "rose" | "gray" | "green";
}

const colorVariants = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-900/30",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-900/30",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-900/30",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-100 dark:border-purple-900/30",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-100 dark:border-rose-900/30",
  },
  gray: {
    bg: "bg-gray-50 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-100 dark:border-gray-700",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-100 dark:border-green-900/30",
  },
};

export default function SummaryCard({
  title,
  value,
  icon,
  trend,
  color = "emerald",
}: SummaryCardProps) {
  const variant = colorVariants[color];

  return (
    <div className="rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4 lg:p-6 shadow-sm transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">{title}</p>
          <p className="mt-1 text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 line-clamp-2">
              <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{trend.value}</span>{" "}
              {trend.label}
            </p>
          )}
        </div>
        <div className={`rounded-md sm:rounded-lg ${variant.bg} p-1.5 sm:p-2 lg:p-3 ${variant.text} transition-colors duration-200 shrink-0 ml-2 sm:ml-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
