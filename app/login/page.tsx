import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-200">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/MyLogoYellow.jpeg"
            alt="Logo"
            className="h-14 w-14 object-cover rounded-full mb-4"
          />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center">
            Quranic Translation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Management System
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Sign in
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Enter your credentials to manage data.
          </p>
          <LoginForm redirectTo={redirect ?? "/"} />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
          Viewing is open to everyone. Login is only needed to add or edit data.
        </p>
      </div>
    </div>
  );
}
