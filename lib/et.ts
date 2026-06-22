// ============================================
// English Translation (ET) module — shared types & pipeline helpers
// ============================================
// A work item flows through an 8-stage pipeline. The "current step / holder"
// is COMPUTED from the stage rows (never stored by hand).

export type StageCode = "TR" | "IF" | "CM" | "ED" | "NR" | "ST" | "FF" | "FPR";

export type ItemBoard = "main_2026" | "kanzul_madaris" | "magazine";
export type ItemStatus = "pending_assignment" | "in_progress" | "completed";
export type ItemPriority = "low" | "normal" | "urgent";

/** Pipeline stages in order, with their full names. */
export const STAGES: { code: StageCode; seq: number; name: string }[] = [
  { code: "TR", seq: 1, name: "Translation" },
  { code: "IF", seq: 2, name: "Initial Formation" },
  { code: "CM", seq: 3, name: "Comparison" },
  { code: "ED", seq: 4, name: "Editing" },
  { code: "NR", seq: 5, name: "Native Review" },
  { code: "ST", seq: 6, name: "S.Tafteesh" },
  { code: "FF", seq: 7, name: "Final Formatting" },
  { code: "FPR", seq: 8, name: "Final Proofreading" },
];

export const STAGE_BY_CODE: Record<StageCode, { seq: number; name: string }> =
  Object.fromEntries(STAGES.map((s) => [s.code, { seq: s.seq, name: s.name }])) as Record<
    StageCode,
    { seq: number; name: string }
  >;

export function stageName(code: StageCode): string {
  return STAGE_BY_CODE[code]?.name ?? code;
}

/** Human-readable label for a content type code. */
export const TYPE_LABELS: Record<string, string> = {
  bks: "Book",
  dwk: "Daily Wazifa / Kalam",
  wsb: "Weekly Ijtima Bayan",
  fsp: "Friday Bayan",
  wbl: "Weekly Booklet",
  quran: "Quran",
  mgz: "Magazine",
  aer: "Aer",
  rpr: "Reprint",
  wss: "Wss",
};

export function typeLabel(type: string | null | undefined): string {
  if (!type) return "—";
  return TYPE_LABELS[type.toLowerCase()] ?? type;
}

export const BOARD_LABELS: Record<ItemBoard, string> = {
  main_2026: "Main (2026)",
  kanzul_madaris: "Kanzul Madaris",
  magazine: "Magazine",
};

// ============================================
// Row types (mirror the DB tables)
// ============================================

export interface EtStage {
  id: string;
  item_id: string;
  stage: StageCode;
  seq: number;
  person: string | null;
  sent_date: string | null;
  received_back_date: string | null;
  not_applicable: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EtItem {
  id: string;
  title: string;
  type: string | null;
  board: ItemBoard;
  received_date: string | null;
  word_count: number | null;
  delivery_date: string | null;
  priority: ItemPriority | null;
  status: ItemStatus;
  further_process: string | null;
  created_at: string;
  updated_at: string;
}

export interface EtItemWithStages extends EtItem {
  stages: EtStage[];
}

export interface EtPerson {
  id: string;
  name: string;
  skills: string | null;
  email: string | null;
  working_hours: string | null;
  dpr_link: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

// ============================================
// Pipeline computation
// ============================================

export interface CurrentStep {
  /** The stage code currently in progress, or null when completed/empty. */
  stage: StageCode | null;
  /** Full name of the current stage (e.g. "Editing"), or a status word. */
  label: string;
  /** Person currently holding the item, or null. */
  holder: string | null;
  /** ISO date the item has been at this step (sent date, or prior received). */
  since: string | null;
  /** True when every applicable stage has been received back. */
  completed: boolean;
  /** No stage has a person assigned yet. */
  unassigned: boolean;
  /** Count of applicable stages that are received back. */
  doneCount: number;
  /** Count of applicable stages. */
  totalCount: number;
}

/**
 * Derive the current step / holder from an item's stage rows.
 * The current step is the first applicable stage whose work has not yet
 * been received back. The holder is that stage's person; "since" is its
 * sent date (falling back to the previous stage's received-back date).
 */
export function computeCurrentStep(stages: EtStage[]): CurrentStep {
  const applicable = [...stages]
    .filter((s) => !s.not_applicable)
    .sort((a, b) => a.seq - b.seq);

  const totalCount = applicable.length;
  const doneCount = applicable.filter((s) => !!s.received_back_date).length;
  const anyAssigned = applicable.some((s) => !!s.person || !!s.sent_date || !!s.received_back_date);

  if (totalCount > 0 && doneCount === totalCount) {
    return {
      stage: null,
      label: "Completed",
      holder: null,
      since: null,
      completed: true,
      unassigned: false,
      doneCount,
      totalCount,
    };
  }

  if (!anyAssigned) {
    return {
      stage: null,
      label: "Pending Assignment",
      holder: null,
      since: null,
      completed: false,
      unassigned: true,
      doneCount,
      totalCount,
    };
  }

  // First applicable stage not yet received back.
  for (let i = 0; i < applicable.length; i++) {
    const s = applicable[i];
    if (!s.received_back_date) {
      const prev = applicable[i - 1];
      return {
        stage: s.stage,
        label: stageName(s.stage),
        holder: s.person ?? null,
        since: s.sent_date ?? prev?.received_back_date ?? null,
        completed: false,
        unassigned: false,
        doneCount,
        totalCount,
      };
    }
  }

  // Fallback (shouldn't reach): treat as completed.
  return {
    stage: null,
    label: "Completed",
    holder: null,
    since: null,
    completed: true,
    unassigned: false,
    doneCount,
    totalCount,
  };
}

/** Days an item has been sitting at its current step (or null). */
export function daysSince(since: string | null, now: Date = new Date()): number | null {
  if (!since) return null;
  const d = new Date(since);
  if (isNaN(d.getTime())) return null;
  return Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
}

/** Tailwind classes for a stage badge, colour-coded by pipeline position. */
export function stageBadgeClasses(stage: StageCode | null, completed = false): string {
  if (completed)
    return "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400";
  if (!stage)
    return "bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-400";
  const map: Record<StageCode, string> = {
    TR: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400",
    IF: "bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-900/20 dark:text-cyan-400",
    CM: "bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-900/20 dark:text-teal-400",
    ED: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400",
    NR: "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-900/20 dark:text-orange-400",
    ST: "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-400",
    FF: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20 dark:bg-fuchsia-900/20 dark:text-fuchsia-400",
    FPR: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-900/20 dark:text-rose-400",
  };
  return map[stage];
}
