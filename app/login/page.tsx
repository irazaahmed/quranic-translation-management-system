import Link from "next/link";
import LoginForm from "./LoginForm";
import LiveClock from "@/components/LiveClock";

export const dynamic = "force-dynamic";

const features = [
  "Track 25+ languages across multiple translation projects",
  "Smart weekly meeting schedule with automatic reminders",
  "Live dashboard with analytics, search & exports",
  "Secure role-based access — view openly, edit safely",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* ───────────── Left: brand / tagline / heading ───────────── */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 px-6 py-10 text-white lg:w-3/5 lg:px-14 lg:py-14">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        {/* Brand */}
        <div className="relative flex items-center gap-3">
          <img
            src="/MyLogoYellow.jpeg"
            alt="Logo"
            className="h-12 w-12 rounded-full object-cover shadow-lg ring-2 ring-white/40"
          />
          <span className="text-lg font-semibold tracking-tight">QTMS</span>
        </div>

        {/* Heading + tagline */}
        <div className="relative mt-10 lg:mt-0 max-w-xl">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Quranic Translation
            <br />
            Management System
          </h1>
          <p className="mt-4 text-base text-white/85 sm:text-lg">
            One real-time home for planning, tracking, and reporting the progress of
            Quranic translation work — across every language and team.
          </p>

          {/* Feature highlights */}
          <ul className="mt-8 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-white/90 sm:text-base">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer: live clock */}
        <div className="relative mt-10 lg:mt-0">
          <LiveClock longDate showIcon className="text-xs text-white/70 sm:text-sm" />
        </div>
      </div>

      {/* ───────────── Right: login portion ───────────── */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm animate-scale-in">
          {/* Compact brand for small screens */}
          <div className="mb-6 flex flex-col items-center lg:hidden">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Welcome back</h2>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm sm:p-7">
            <h2 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
              Sign in
            </h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Enter your credentials to add or manage data.
            </p>
            <LoginForm redirectTo={redirect ?? "/"} />

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 dark:text-gray-500">or</span>
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Continue without login (view-only) */}
            <Link
              href="/view"
              prefetch={false}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Continue without login
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
            Viewing is open to everyone. Login is only needed to add or edit data.
          </p>
        </div>
      </div>
    </div>
  );
}
