import DashboardLayout from "@/components/DashboardLayout";

function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`} />;
}

/** Generic table-style skeleton used while a list page loads. */
export function TableSkeleton({ rows = 6, title = "Loading…" }: { rows?: number; title?: string }) {
  return (
    <DashboardLayout>
      <div className="mb-6 space-y-2">
        <Shimmer className="h-7 w-48" />
        <Shimmer className="h-4 w-72" />
      </div>
      <div className="mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Shimmer className="h-4 w-1/4" />
            <Shimmer className="h-4 w-1/5" />
            <Shimmer className="h-4 w-1/6" />
            <Shimmer className="ml-auto h-7 w-24" />
          </div>
        ))}
      </div>
      <span className="sr-only">{title}</span>
    </DashboardLayout>
  );
}

/** Dashboard skeleton: stat cards + content blocks. */
export function DashboardSkeleton() {
  return (
    <DashboardLayout>
      <div className="mb-6 space-y-2">
        <Shimmer className="h-7 w-40" />
        <Shimmer className="h-4 w-64" />
      </div>
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <Shimmer className="h-8 w-8 rounded-lg mb-4" />
            <Shimmer className="h-7 w-16 mb-2" />
            <Shimmer className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 h-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <Shimmer className="h-5 w-40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Shimmer key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="h-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <Shimmer className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Shimmer key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
