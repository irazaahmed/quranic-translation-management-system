"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePermissions } from "@/components/AuthProvider";

interface DashboardHeroProps {
  needsAttention: number;
  upcoming: number;
  meetingsThisWeek: number;
}

export default function DashboardHero({
  needsAttention,
  upcoming,
  meetingsThisWeek,
}: DashboardHeroProps) {
  const { profile } = usePermissions();
  const [greeting, setGreeting] = useState("Welcome");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    setDateStr(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  const name = profile?.full_name?.trim() || profile?.email?.split("@")[0];

  return (
    <div className="animate-fade-in-up relative mb-4 sm:mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 p-5 sm:p-7 text-white shadow-lg">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 right-24 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-white/80">{dateStr || " "}</p>
          <h2 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-bold">
            {greeting}
            {name ? (
              <span className="capitalize">, {name}</span>
            ) : (
              <span> 👋</span>
            )}
          </h2>
          <p className="mt-1 text-sm text-white/85">
            {needsAttention > 0
              ? `${needsAttention} language${needsAttention === 1 ? "" : "s"} need follow-up attention.`
              : "Everything's on track. Great work! 🎉"}
          </p>
        </div>

        {/* Quick highlight chips */}
        <div className="flex flex-shrink-0 gap-3">
          <Link
            href="/schedule"
            className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm text-center transition-colors hover:bg-white/25"
          >
            <div className="text-2xl font-bold tabular-nums">{meetingsThisWeek}</div>
            <div className="text-[11px] uppercase tracking-wide text-white/80">This week</div>
          </Link>
          <Link
            href="#upcoming"
            className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm text-center transition-colors hover:bg-white/25"
          >
            <div className="text-2xl font-bold tabular-nums">{upcoming}</div>
            <div className="text-[11px] uppercase tracking-wide text-white/80">Upcoming</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
