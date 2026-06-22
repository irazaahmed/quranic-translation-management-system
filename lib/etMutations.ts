import "server-only";
import { createClient as createServerSupabase } from "./supabase/server";
import {
  blankStages,
  deriveStatus,
  STAGES,
  type EtItem,
  type EtStage,
  type ItemBoard,
  type ItemPriority,
  type ItemStatus,
  type StageCode,
} from "./et";

/**
 * Write operations for the English Translation module. Server-only; uses the
 * request-scoped Supabase client bound to the logged-in user's session so RLS
 * applies. Callers (server actions) must gate with requireStaff().
 */
async function getWriteClient() {
  return await createServerSupabase();
}

export interface CreateEtItemInput {
  title: string;
  type: string | null;
  board: ItemBoard;
  received_date: string | null;
  word_count: number | null;
  delivery_date: string | null;
  priority: ItemPriority | null;
  further_process: string | null;
}

/** Create an item plus its 8 (blank) pipeline stage rows. Returns the new id. */
export async function createEtItem(input: CreateEtItemInput): Promise<string> {
  const supabase = await getWriteClient();

  const { data: item, error } = await supabase
    .from("et_items")
    .insert([
      {
        title: input.title,
        type: input.type,
        board: input.board,
        received_date: input.received_date,
        word_count: input.word_count,
        delivery_date: input.delivery_date,
        priority: input.priority,
        status: "pending_assignment",
        further_process: input.further_process,
      },
    ])
    .select("id")
    .single();

  if (error) throw error;
  const itemId = item.id as string;

  const stageRows = blankStages().map((s) => ({ ...s, item_id: itemId }));
  const { error: stageError } = await supabase.from("et_stages").insert(stageRows);
  if (stageError) throw stageError;

  return itemId;
}

export type UpdateEtItemInput = Partial<
  Pick<
    EtItem,
    "title" | "type" | "board" | "received_date" | "word_count" | "delivery_date" | "priority" | "further_process"
  >
>;

export async function updateEtItem(itemId: string, input: UpdateEtItemInput): Promise<void> {
  const supabase = await getWriteClient();
  const { error } = await supabase.from("et_items").update(input).eq("id", itemId);
  if (error) throw error;
}

export async function deleteEtItem(itemId: string): Promise<void> {
  const supabase = await getWriteClient();
  // et_stages cascade-delete via FK.
  const { error } = await supabase.from("et_items").delete().eq("id", itemId);
  if (error) throw error;
}

export interface StageUpsert {
  stage: StageCode;
  person: string | null;
  sent_date: string | null;
  received_back_date: string | null;
  not_applicable: boolean;
  merged: boolean;
}

/**
 * Save all pipeline stages for an item in one call, then recompute and store
 * the item's derived status. Relies on UNIQUE(item_id, stage).
 */
export async function saveEtStages(itemId: string, stages: StageUpsert[]): Promise<void> {
  const supabase = await getWriteClient();
  const seqByCode = Object.fromEntries(STAGES.map((s) => [s.code, s.seq]));

  const rows = stages.map((s) => ({
    item_id: itemId,
    stage: s.stage,
    seq: seqByCode[s.stage],
    person: s.person?.trim() || null,
    sent_date: s.sent_date || null,
    received_back_date: s.received_back_date || null,
    not_applicable: !!s.not_applicable,
    merged: !!s.merged,
  }));

  const { error } = await supabase
    .from("et_stages")
    .upsert(rows, { onConflict: "item_id,stage" });
  if (error) throw error;

  // Recompute status from the just-saved stage data.
  const status: ItemStatus = deriveStatus(rows as unknown as EtStage[]);
  const { error: statusError } = await supabase
    .from("et_items")
    .update({ status })
    .eq("id", itemId);
  if (statusError) throw statusError;
}
