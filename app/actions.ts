"use server";

import { revalidatePath } from "next/cache";
import {
  deleteFoodRow,
  getFoodRow,
  insertFood,
  updateFoodRow,
  type FoodInput,
  type FoodKind,
} from "@/lib/foods";
import { deleteEntryRow, insertEntry, isMeal, isValidDay } from "@/lib/log";

function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function number(formData: FormData, key: string, fallback?: number): number {
  const raw = text(formData, key);
  if (raw === "" && fallback !== undefined) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid value for ${key}`);
  return n;
}

function parseFood(formData: FormData): FoodInput {
  const name = text(formData, "name");
  if (!name) throw new Error("Name is required");
  const kind = text(formData, "kind");
  if (kind !== "homemade" && kind !== "packaged") {
    throw new Error("Invalid food kind");
  }
  return {
    name,
    kind: kind as FoodKind,
    barcode: text(formData, "barcode") || null,
    servingLabel: text(formData, "serving_label") || "1 serving",
    calories: number(formData, "calories"),
    proteinG: number(formData, "protein_g", 0),
    carbsG: number(formData, "carbs_g", 0),
    fatG: number(formData, "fat_g", 0),
    notes: text(formData, "notes") || null,
  };
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/foods");
}

export async function createFood(formData: FormData) {
  await insertFood(parseFood(formData));
  refresh();
}

export async function updateFood(id: number, formData: FormData) {
  await updateFoodRow(id, parseFood(formData));
  refresh();
}

export async function deleteFood(id: number) {
  await deleteFoodRow(id);
  refresh();
}

export async function logFood(formData: FormData) {
  const food = await getFoodRow(Number(text(formData, "food_id")));
  if (!food) throw new Error("Pick a food to log");
  const day = text(formData, "day");
  if (!isValidDay(day)) throw new Error("Invalid date");
  const meal = text(formData, "meal");
  if (!isMeal(meal)) throw new Error("Pick breakfast, lunch or dinner");
  const quantity = number(formData, "quantity", 1);
  if (quantity <= 0) throw new Error("Quantity must be greater than 0");
  await insertEntry(food, day, meal, quantity);
  refresh();
}

export async function deleteEntry(id: number) {
  await deleteEntryRow(id);
  refresh();
}
