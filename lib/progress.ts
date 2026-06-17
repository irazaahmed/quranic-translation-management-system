// ============================================================
// Para / Stage progress — shared constants, types & helpers
// Safe to import from both server and client components (pure data).
// ============================================================

/** The Quran has 30 paras (juz). */
export const TOTAL_PARAS = 30;

export type StageKey =
  | "translation"
  | "comparison"
  | "formation"
  | "tafteesh"
  | "designing"
  | "final_proof_reading";

export interface StageMeta {
  key: StageKey;
  /** Full display label. */
  label: string;
  /** Pipeline position (1 = first). */
  order: number;
  /** Tailwind class for the solid progress-bar fill. */
  bar: string;
  /** Tailwind text colour for accents. */
  text: string;
  /** Tailwind soft background for chips/dots. */
  dot: string;
}

/**
 * The 6 stages every para passes through, in pipeline order.
 * A later stage's para count can never exceed an earlier stage's — the work
 * flows strictly forward, which gives the board its natural "staircase" look.
 */
export const STAGES: StageMeta[] = [
  { key: "translation",         label: "Translation",          order: 1, bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  { key: "comparison",          label: "Comparison",           order: 2, bar: "bg-sky-500",     text: "text-sky-600 dark:text-sky-400",         dot: "bg-sky-500" },
  { key: "formation",           label: "Formation",            order: 3, bar: "bg-indigo-500",  text: "text-indigo-600 dark:text-indigo-400",   dot: "bg-indigo-500" },
  { key: "tafteesh",            label: "Tafteesh",             order: 4, bar: "bg-violet-500",  text: "text-violet-600 dark:text-violet-400",   dot: "bg-violet-500" },
  { key: "designing",           label: "Designing",            order: 5, bar: "bg-amber-500",   text: "text-amber-600 dark:text-amber-400",     dot: "bg-amber-500" },
  { key: "final_proof_reading", label: "Final Proof Reading",  order: 6, bar: "bg-rose-500",    text: "text-rose-600 dark:text-rose-400",       dot: "bg-rose-500" },
];

export const STAGE_KEYS: StageKey[] = STAGES.map((s) => s.key);

export function getStageMeta(key: StageKey): StageMeta {
  return STAGES.find((s) => s.key === key) ?? STAGES[0];
}

/** A single (language, stage) progress row as stored in the DB. */
export interface StageProgressRow {
  stage: StageKey;
  current_para: number;
  since_date: string | null;
  notes: string | null;
  updated_at: string | null;
}

/** A language with its full 6-stage progress, ready for the board/UI. */
export interface LanguageProgress {
  languageId: string;
  language: string;
  country: string;
  responsiblePerson: string | null;
  projectId: string | null;
  projectName: string | null;
  /** Always contains all 6 stages (missing rows default to 0 paras). */
  stages: Record<StageKey, StageProgressRow>;
  /** Overall pipeline completion across all stages (0–100). */
  pipelinePercent: number;
  /** Paras that have cleared every stage (= final proof reading count). */
  finishedParas: number;
}

/** All progress for a single project, grouped for the board. */
export interface ProjectProgress {
  projectId: string;
  projectName: string;
  languages: LanguageProgress[];
}

function emptyStage(stage: StageKey): StageProgressRow {
  return { stage, current_para: 0, since_date: null, notes: null, updated_at: null };
}

/** Turn sparse DB rows into a complete 6-stage map (missing → 0). */
export function buildStageMap(
  rows: StageProgressRow[] | null | undefined
): Record<StageKey, StageProgressRow> {
  const map = {} as Record<StageKey, StageProgressRow>;
  for (const key of STAGE_KEYS) map[key] = emptyStage(key);
  for (const row of rows ?? []) {
    if (map[row.stage]) {
      map[row.stage] = {
        stage: row.stage,
        current_para: clampPara(row.current_para),
        since_date: row.since_date ?? null,
        notes: row.notes ?? null,
        updated_at: row.updated_at ?? null,
      };
    }
  }
  return map;
}

/** Overall completion of the whole pipeline (all 6 stages averaged), 0–100. */
export function computePipelinePercent(
  stages: Record<StageKey, StageProgressRow>
): number {
  const total = STAGE_KEYS.reduce((sum, key) => sum + stages[key].current_para, 0);
  return Math.round((total / (STAGE_KEYS.length * TOTAL_PARAS)) * 100);
}

export function clampPara(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(TOTAL_PARAS, Math.round(n)));
}

export function stagePercent(currentPara: number): number {
  return Math.round((clampPara(currentPara) / TOTAL_PARAS) * 100);
}
