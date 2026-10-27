// The meals, and the rules for editing a logged entry. No database imports, so it is easy to test.
import type { MealType } from "@/generated/prisma/enums";

export type { MealType };

export const MEALS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

export function isMeal(s: string): s is MealType {
  return MEALS.some((m) => m.value === s);
}

export const MAX_SERVINGS = 1000;

export type EntryEdit = { quantity: number; meal: MealType };

export type EntryEditResult =
  | { ok: true; value: EntryEdit }
  | { ok: false; field: "quantity" | "meal"; error: string };

// `raw` is what the form posts: trimmed strings.
export function parseEntryEdit(raw: { quantity: string; meal: string }): EntryEditResult {
  if (!isMeal(raw.meal)) {
    return { ok: false, field: "meal", error: "Pick breakfast, lunch, dinner or snack" };
  }
  const quantity = raw.quantity === "" ? NaN : Number(raw.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > MAX_SERVINGS) {
    return { ok: false, field: "quantity", error: `Servings must be more than 0 and at most ${MAX_SERVINGS}` };
  }
  return { ok: true, value: { quantity, meal: raw.meal } };
}
