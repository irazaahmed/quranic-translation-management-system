export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-6 px-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Managed by */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              Managed by
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-200">
              Ahmed Raza
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              Team Lead – Quranic Translation Department
            </p>
          </div>

          {/* Right side - Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              © 2026 Ahmed Raza
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
