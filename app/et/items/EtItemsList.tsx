"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BOARD_LABELS,
  STAGES,
  type ItemBoard,
  type StageCode,
  daysSince,
  stageBadgeClasses,
  typeLabel,
} from "@/lib/et";
import type { EtItemRow } from "@/lib/etData";

function fmtDate(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function statusBadge(status: string): { className: string; label: string } {
  switch (status) {
    case "completed":
      return { className: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400", label: "Completed" };
    case "pending_assignment":
      return { className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", label: "Unassigned" };
    case "in_progress":
    default:
      return { className: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400", label: "In Progress" };
  }
}

function StageBadge({ row }: { row: EtItemRow }) {
  const { current } = row;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${stageBadgeClasses(
        current.stage,
        current.completed
      )}`}
    >
      {current.stage ? `${current.stage} · ${current.label}` : current.label}
    </span>
  );
}

interface Props {
  items: EtItemRow[];
  initial?: { holder?: string; stage?: string; board?: string; status?: string };
}

export default function EtItemsList({ items, initial }: Props) {
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState<string>(initial?.board ?? "all");
  const [status, setStatus] = useState<string>(initial?.status ?? "active");
  const [stage, setStage] = useState<string>(initial?.stage ?? "all");
  const [holder, setHolder] = useState<string>(initial?.holder ?? "all");
  const [sortBy, setSortBy] = useState<string>("oldest");

  const holders = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.current.holder && set.add(i.current.holder));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const hasFilter =
    query.trim() !== "" || board !== "all" || status !== "active" || stage !== "all" || holder !== "all";

  const reset = () => {
    setQuery("");
    setBoard("all");
    setStatus("active");
    setStage("all");
    setHolder("all");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => board === "all" || i.board === board)
      .filter((i) => {
        if (status === "all") return true;
        if (status === "active") return i.status !== "completed";
        return i.status === status;
      })
      .filter((i) => stage === "all" || i.current.stage === stage)
      .filter((i) => holder === "all" || i.current.holder === holder)
      .filter(
        (i) =>
          q === "" ||
          i.title.toLowerCase().includes(q) ||
          (i.current.holder || "").toLowerCase().includes(q) ||
          (i.type || "").toLowerCase().includes(q)
      )
      .sort((a, b) => {
        switch (sortBy) {
          case "title":
            return a.title.localeCompare(b.title);
          case "words":
            return (b.word_count || 0) - (a.word_count || 0);
          case "stuck": {
            const ad = daysSince(a.current.since) ?? -1;
            const bd = daysSince(b.current.since) ?? -1;
            return bd - ad;
          }
          case "oldest":
          default: {
            const at = a.current.since ? new Date(a.current.since).getTime() : Infinity;
            const bt = b.current.since ? new Date(b.current.since).getTime() : Infinity;
            return at - bt;
          }
        }
      });
  }, [items, query, board, status, stage, holder, sortBy]);

  const selectCls =
    "rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <>
      {/* Filters */}
      <div className="mb-4 sm:mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, person, type…"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <select aria-label="Filter by board" value={board} onChange={(e) => setBoard(e.target.value)} className={selectCls}>
            <option value="all">All Boards</option>
            {(Object.keys(BOARD_LABELS) as ItemBoard[]).map((b) => (
              <option key={b} value={b}>{BOARD_LABELS[b]}</option>
            ))}
          </select>

          <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
            <option value="active">Active (not completed)</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_assignment">Unassigned</option>
            <option value="completed">Completed</option>
            <option value="all">All Statuses</option>
          </select>

          <select aria-label="Filter by current stage" value={stage} onChange={(e) => setStage(e.target.value)} className={selectCls}>
            <option value="all">All Stages</option>
            {STAGES.map((s) => (
              <option key={s.code} value={s.code}>{s.code} · {s.name}</option>
            ))}
          </select>

          <select aria-label="Filter by holder" value={holder} onChange={(e) => setHolder(e.target.value)} className={selectCls}>
            <option value="all">All Holders</option>
            {holders.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="et_sort" className="text-sm text-gray-500 dark:text-gray-400">Sort by:</label>
            <select id="et_sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${selectCls} py-1.5`}>
              <option value="oldest">At step since (oldest)</option>
              <option value="stuck">Most stuck</option>
              <option value="title">Title (A–Z)</option>
              <option value="words">Words (high→low)</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Showing {filtered.length} of {items.length}</span>
            {hasFilter && (
              <button onClick={reset} className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {["Title", "Type", "Board", "Current Step", "Holder", "Progress", "At step since"].map((h) => (
                <th key={h} scope="col" className="px-3 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((row) => {
              const d = daysSince(row.current.since);
              return (
                <tr key={row.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-3 lg:px-4 py-3 max-w-[360px]">
                    <Link href={`/et/items/${row.id}`} className="block text-sm font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate" title={row.title}>
                      {row.title}
                    </Link>
                  </td>
                  <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{typeLabel(row.type)}</td>
                  <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{BOARD_LABELS[row.board]}</td>
                  <td className="px-3 lg:px-4 py-3 whitespace-nowrap"><StageBadge row={row} /></td>
                  <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{row.current.holder || "—"}</td>
                  <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                    <span className="text-sm tabular-nums text-gray-600 dark:text-gray-400">{row.current.doneCount}/{row.current.totalCount}</span>
                  </td>
                  <td className="px-3 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {fmtDate(row.current.since)}
                    {d !== null && d > 30 && (
                      <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">{d}d</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden grid gap-3">
        {filtered.map((row) => {
          const sb = statusBadge(row.status);
          return (
            <Link
              key={row.id}
              href={`/et/items/${row.id}`}
              className="gloss card-hover block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="flex-1 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{row.title}</h3>
                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${sb.className}`}>{sb.label}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StageBadge row={row} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{typeLabel(row.type)} · {BOARD_LABELS[row.board]}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Holder</p>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{row.current.holder || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Progress · since</p>
                  <p className="font-medium text-gray-900 dark:text-white">{row.current.doneCount}/{row.current.totalCount} · {fmtDate(row.current.since)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No items match these filters</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try clearing the filters to see everything.</p>
          </div>
        </div>
      )}
    </>
  );
}
