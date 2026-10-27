"use server";

import { revalidatePath } from "next/cache";
import { fail, succeed, type ActionResult } from "@/lib/action-result";
import { saveGoalsRow } from "@/lib/goals";
import { parseFoodInput } from "@/lib/food-input";
import { parseGoals } from "@/lib/goals-input";
import {
  deleteFoodRow,
  getFoodRow,
  insertFood,
  updateFoodRow,
} from "@/lib/foods";
import { deleteEntryRow, insertEntry, isMeal, isValidDay, todayLocal, updateEntryRow } from "@/lib/log";
import { parseEntryEdit } from "@/lib/meals";
import { parseProfile } from "@/lib/profile";
import { getCurrentUser, isUniqueViolation, updateUserRow } from "@/lib/users";

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

function parseFood(formData: FormData) {
  return parseFoodInput({
    name: text(formData, "name"),
    kind: text(formData, "kind"),
    serving_label: text(formData, "serving_label"),
    calories: text(formData, "calories"),
    protein_g: text(formData, "protein_g"),
    carbs_g: text(formData, "carbs_g"),
    fat_g: text(formData, "fat_g"),
    barcode: text(formData, "barcode"),
    notes: text(formData, "notes"),
  });
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/foods");
}

export async function createFood(formData: FormData): Promise<ActionResult> {
  const parsed = parseFood(formData);
  if (!parsed.ok) return fail("Please fix the highlighted fields.", parsed.fieldErrors);
  await insertFood(parsed.value);
  refresh();
  return succeed(`Saved ${parsed.value.name}`);
}

export async function updateFood(id: number, formData: FormData): Promise<ActionResult> {
  const parsed = parseFood(formData);
  if (!parsed.ok) return fail("Please fix the highlighted fields.", parsed.fieldErrors);
  await updateFoodRow(id, parsed.value);
  refresh();
  return succeed(`Updated ${parsed.value.name}`);
}

export async function deleteFood(id: number, name: string): Promise<ActionResult> {
  await deleteFoodRow(id);
  refresh();
  return succeed(`Deleted ${name}`);
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

export async function saveGoals(formData: FormData): Promise<ActionResult> {
  const parsed = parseGoals({
    calories: text(formData, "calories"),
    carbs_g: text(formData, "carbs_g"),
    protein_g: text(formData, "protein_g"),
    fat_g: text(formData, "fat_g"),
  });
  if (!parsed.ok) return fail("Please fix the highlighted fields.", parsed.fieldErrors);
  await saveGoalsRow(parsed.value);
  refresh();
  revalidatePath("/goals");
  return succeed("Goals saved");
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return fail("No profile to update.");
  const parsed = parseProfile(
    {
      name: text(formData, "name"),
      email: text(formData, "email"),
      dateOfBirth: text(formData, "date_of_birth"),
      heightCm: text(formData, "height_cm"),
      weightKg: text(formData, "weight_kg"),
    },
    todayLocal(),
  );
  if (!parsed.ok) return fail("Please fix the highlighted fields.", parsed.fieldErrors);
  try {
    await updateUserRow(user.id, parsed.value);
  } catch (e) {
    if (isUniqueViolation(e)) {
      return fail("Please fix the highlighted fields.", { email: "That email is already in use" });
    }
    throw e;
  }
  revalidatePath("/profile");
  return succeed("Profile saved");
}

export async function updateEntry(id: number, formData: FormData) {
  const parsed = parseEntryEdit({
    quantity: text(formData, "quantity"),
    meal: text(formData, "meal"),
  });
  if (!parsed.ok) throw new Error(parsed.error);
  await updateEntryRow(id, parsed.value);
  refresh();
}

export async function deleteEntry(id: number) {
  await deleteEntryRow(id);
  refresh();
}
