"use server";

import { revalidatePath } from "next/cache";
import { fail, isUniqueViolation, succeed, type ActionResult, type RemoveResult } from "@/lib/action-result";
import { saveGoalsRow } from "@/lib/goals";
import { parseFoodInput } from "@/lib/food-input";
import { parseGoals } from "@/lib/goals-input";
import {
  deleteFoodRow,
  getFoodRow,
  insertFood,
  updateFoodRow,
} from "@/lib/foods";
import {
  deleteEntryRow,
  getEntryRow,
  insertEntry,
  isMeal,
  isValidDay,
  restoreEntryRow,
  toRestorable,
  todayLocal,
  updateEntryRow,
} from "@/lib/log";
import { parseEntryEdit, parseQuantity, parseRestorableEntry } from "@/lib/meals";
import { parseProfile } from "@/lib/profile";
import { getCurrentUser, updateUserRow } from "@/lib/users";

function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
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

export async function logFood(formData: FormData): Promise<ActionResult> {
  // Quick-add posts "1"; a blank servings box on the full form means 1 too.
  const quantity = parseQuantity(text(formData, "quantity") || "1");
  if (!quantity.ok) return fail("Please fix the highlighted fields.", { quantity: quantity.error });
  const food = await getFoodRow(Number(text(formData, "food_id")));
  if (!food) return fail("That food no longer exists. Refresh and try again.");
  const day = text(formData, "day");
  if (!isValidDay(day)) return fail("That date isn't valid.");
  const meal = text(formData, "meal");
  if (!isMeal(meal)) return fail("Pick breakfast, lunch, dinner or snack.");
  await insertEntry(food, day, meal, quantity.value);
  refresh();
  return succeed(`Added ${food.name} to ${meal}`);
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

export async function updateEntry(id: number, formData: FormData): Promise<ActionResult> {
  const parsed = parseEntryEdit({
    quantity: text(formData, "quantity"),
    meal: text(formData, "meal"),
  });
  if (!parsed.ok) return fail("Please fix the highlighted fields.", { [parsed.field]: parsed.error });
  await updateEntryRow(id, parsed.value);
  refresh();
  return succeed("Entry updated");
}

// Returns a full copy of the removed entry so the browser can offer Undo.
export async function removeEntry(id: number): Promise<RemoveResult> {
  const row = await getEntryRow(id);
  if (!row) return { ok: false, error: "That entry was already removed." };
  await deleteEntryRow(id);
  refresh();
  return { ok: true, entry: toRestorable(row) };
}

// `raw` comes back from the browser, so it is validated like any other input.
export async function restoreEntry(raw: unknown): Promise<ActionResult> {
  const parsed = parseRestorableEntry(raw);
  if (!parsed.ok) return fail(parsed.error);
  try {
    await restoreEntryRow(parsed.value);
  } catch (e) {
    if (isUniqueViolation(e)) return fail("That entry is already back.");
    throw e;
  }
  refresh();
  return succeed(`Restored ${parsed.value.foodName}`);
}
