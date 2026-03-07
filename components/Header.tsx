"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function Header() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(date.toLocaleDateString("en-US", options));
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent('sidebar-toggle-request'));
  };

  // Get the icon based on resolved theme (actual applied theme)
  const getThemeIcon = () => {
    if (theme === "system") {
      // Show sun for light system, moon for dark system
      return resolvedTheme === "dark" ? (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    }
    return theme === "dark" ? (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ) : (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-3 sm:px-4 lg:px-6 transition-colors duration-200">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          {/* Mobile menu button - visible only on mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden rounded-lg p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/MyLogoYellow.jpeg"
              alt="Logo"
              className="h-6 w-6 sm:h-8 sm:w-8 object-cover rounded-full flex-shrink-0"
            />
            <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 min-w-0 transition-colors duration-200">
              <span className="hidden sm:inline">Quranic Translation</span> Management System
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
          <span className="hidden lg:block text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{currentDate}</span>

          {/* Theme Selector Dropdown */}
          {mounted && (
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                aria-label="Select theme"
                aria-expanded={isOpen}
              >
                {getThemeIcon()}
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 z-10 lg:hidden"
                    onClick={() => setIsOpen(false)}
                  />
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-200 ${
                        theme === "light"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Light
                    </button>
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-200 ${
                        theme === "dark"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Dark
                    </button>
                    <button
                      onClick={() => handleThemeChange("system")}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-200 ${
                        theme === "system"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      System
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center transition-colors duration-200">
              <span className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300 transition-colors duration-200">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
