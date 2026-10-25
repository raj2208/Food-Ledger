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
import { deleteEntryRow, insertEntry, isValidDay } from "@/lib/log";

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
    serving_label: text(formData, "serving_label") || "1 serving",
    calories: number(formData, "calories"),
    protein_g: number(formData, "protein_g", 0),
    carbs_g: number(formData, "carbs_g", 0),
    fat_g: number(formData, "fat_g", 0),
  };
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/foods");
}

export async function createFood(formData: FormData) {
  insertFood(parseFood(formData));
  refresh();
}

export async function updateFood(id: number, formData: FormData) {
  updateFoodRow(id, parseFood(formData));
  refresh();
}

export async function deleteFood(id: number) {
  deleteFoodRow(id);
  refresh();
}

export async function logFood(formData: FormData) {
  const food = getFoodRow(Number(text(formData, "food_id")));
  if (!food) throw new Error("Pick a food to log");
  const day = text(formData, "day");
  if (!isValidDay(day)) throw new Error("Invalid date");
  const quantity = number(formData, "quantity", 1);
  if (quantity <= 0) throw new Error("Quantity must be greater than 0");
  insertEntry(food, day, quantity);
  refresh();
}

export async function deleteEntry(id: number) {
  deleteEntryRow(id);
  refresh();
}
