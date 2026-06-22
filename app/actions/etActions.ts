"use server";

import { requireStaff } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createEtItem,
  updateEtItem,
  deleteEtItem,
  saveEtStages,
  type StageUpsert,
} from "@/lib/etMutations";
import type { ItemBoard, ItemPriority } from "@/lib/et";

export interface EtFormState {
  error?: string;
  success?: boolean;
}

const VALID_BOARDS: ItemBoard[] = ["main_2026", "kanzul_madaris", "magazine"];
const VALID_PRIORITIES: ItemPriority[] = ["low", "normal", "urgent"];

function parseBoard(v: string | null): ItemBoard {
  return VALID_BOARDS.includes(v as ItemBoard) ? (v as ItemBoard) : "main_2026";
}
function parsePriority(v: string | null): ItemPriority | null {
  return VALID_PRIORITIES.includes(v as ItemPriority) ? (v as ItemPriority) : null;
}
function parseInt0(v: string | null): number | null {
  if (!v || !v.trim()) return null;
  const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(n) ? null : n;
}

function revalidateEt(itemId?: string) {
  revalidatePath("/et");
  revalidatePath("/et/items");
  if (itemId) revalidatePath(`/et/items/${itemId}`);
}

export async function createEtItemAction(
  _prev: EtFormState,
  formData: FormData
): Promise<EtFormState> {
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required" };

  let newId: string;
  try {
    await requireStaff();
    newId = await createEtItem({
      title,
      type: (formData.get("type") as string)?.trim() || null,
      board: parseBoard(formData.get("board") as string),
      received_date: (formData.get("received_date") as string) || null,
      word_count: parseInt0(formData.get("word_count") as string),
      delivery_date: (formData.get("delivery_date") as string) || null,
      priority: parsePriority(formData.get("priority") as string),
      further_process: (formData.get("further_process") as string)?.trim() || null,
    });
    revalidateEt();
  } catch (error) {
    console.error("Failed to create ET item:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "You don't have permission to add items." };
    }
    return { error: "Failed to create item. Please try again." };
  }
  redirect(`/et/items/${newId}`);
}

export async function updateEtItemAction(
  _prev: EtFormState,
  formData: FormData
): Promise<EtFormState> {
  const itemId = formData.get("item_id") as string;
  const title = (formData.get("title") as string)?.trim();
  if (!itemId) return { error: "Missing item id" };
  if (!title) return { error: "Title is required" };

  try {
    await requireStaff();
    await updateEtItem(itemId, {
      title,
      type: (formData.get("type") as string)?.trim() || null,
      board: parseBoard(formData.get("board") as string),
      received_date: (formData.get("received_date") as string) || null,
      word_count: parseInt0(formData.get("word_count") as string),
      delivery_date: (formData.get("delivery_date") as string) || null,
      priority: parsePriority(formData.get("priority") as string),
      further_process: (formData.get("further_process") as string)?.trim() || null,
    });
    revalidateEt(itemId);
  } catch (error) {
    console.error("Failed to update ET item:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "You don't have permission to edit items." };
    }
    return { error: "Failed to update item. Please try again." };
  }
  redirect(`/et/items/${itemId}`);
}

/** Save the full pipeline (called from the client pipeline editor). */
export async function saveEtStagesAction(
  itemId: string,
  stages: StageUpsert[]
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireStaff();
    await saveEtStages(itemId, stages);
    revalidateEt(itemId);
    return { success: true };
  } catch (error) {
    console.error("Failed to save stages:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "You don't have permission to update the pipeline." };
    }
    return { error: "Failed to save. Please try again." };
  }
}

export async function deleteEtItemAction(itemId: string): Promise<{ error?: string }> {
  try {
    await requireStaff();
    await deleteEtItem(itemId);
    revalidateEt();
    return {};
  } catch (error) {
    console.error("Failed to delete ET item:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "You don't have permission to delete items." };
    }
    return { error: "Failed to delete item. Please try again." };
  }
}
