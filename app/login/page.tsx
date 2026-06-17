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

const stats = [
  { value: "25+", label: "Languages" },
  { value: "3", label: "Projects" },
  { value: "100%", label: "Open to view" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* ───────────── Left: brand / tagline / heading ───────────── */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 px-6 py-10 text-white lg:w-3/5 lg:px-16 lg:py-14">
        {/* Decorative dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* Glowing blobs */}
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-6 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />

        {/* Brand */}
        <div className="relative flex items-center gap-3 animate-fade-in">
          <img
            src="/MyLogoYellow.jpeg"
            alt="Logo"
            className="h-12 w-12 rounded-full object-cover shadow-lg ring-2 ring-white/40"
          />
          <span className="text-lg font-semibold tracking-tight">QTMS</span>
        </div>

        {/* Heading + tagline */}
        <div className="relative mt-10 lg:mt-0 max-w-xl animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Real-time translation management
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Quranic Translation
            <br />
            <span className="bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
              Management System
            </span>
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

          {/* Stat chips */}
          <div className="mt-9 grid max-w-md grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-sm"
              >
                <div className="text-xl font-bold sm:text-2xl">{s.value}</div>
                <div className="mt-0.5 text-[11px] uppercase tracking-wide text-white/70">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: live clock */}
        <div className="relative mt-10 lg:mt-0">
          <LiveClock longDate showIcon className="text-xs text-white/70 sm:text-sm" />
        </div>
      </div>

      {/* ───────────── Right: login portion ───────────── */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        {/* Soft backdrop accents (light side) */}
        <div className="pointer-events-none absolute -top-20 right-0 h-60 w-60 rounded-full bg-emerald-300/20 dark:bg-emerald-700/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-60 w-60 rounded-full bg-blue-300/20 dark:bg-blue-700/10 blur-3xl" />

        <div className="relative w-full max-w-sm animate-scale-in">
          {/* Compact brand for small screens */}
          <div className="mb-6 flex flex-col items-center text-center lg:hidden">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sign in to continue, or browse as a guest.
            </p>
          </div>

          {/* Gradient ring wrapper */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/40 via-transparent to-blue-500/40 p-px shadow-xl">
            <div className="rounded-2xl bg-white/90 dark:bg-gray-900/80 p-6 backdrop-blur-xl sm:p-7">
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
                className="btn-press flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Continue without login
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
            Viewing is open to everyone. Login is only needed to add or edit data.
          </p>
        </div>
      </div>
    </div>
  );
}
