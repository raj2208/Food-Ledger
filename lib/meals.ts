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

export type QuantityResult = { ok: true; value: number } | { ok: false; error: string };

// Servings: a positive number, capped so a typo like 40000 is caught.
export function parseQuantity(raw: string): QuantityResult {
  const quantity = raw === "" ? NaN : Number(raw);
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > MAX_SERVINGS) {
    return { ok: false, error: `Servings must be more than 0 and at most ${MAX_SERVINGS}` };
  }
  return { ok: true, value: quantity };
}

// `raw` is what the form posts: trimmed strings.
export function parseEntryEdit(raw: { quantity: string; meal: string }): EntryEditResult {
  if (!isMeal(raw.meal)) {
    return { ok: false, field: "meal", error: "Pick breakfast, lunch, dinner or snack" };
  }
  const quantity = parseQuantity(raw.quantity);
  if (!quantity.ok) return { ok: false, field: "quantity", error: quantity.error };
  return { ok: true, value: { quantity: quantity.value, meal: raw.meal } };
}

// A removed entry, as handed to the browser so "Undo" can put it back exactly as it was.
export type RestorableEntry = {
  id: number;
  foodId: number | null;
  eatenOn: string; // "YYYY-MM-DD"
  meal: MealType | null;
  quantity: number;
  foodName: string;
  servingLabel: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  createdAt: string; // ISO timestamp
};

function isRealDay(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v > 0;
const isAmount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1_000_000;
const isText = (v: unknown, max: number): v is string => typeof v === "string" && v.length > 0 && v.length <= max;

// The copy comes back from the browser, so it is validated like any other input. No type
// coercion: a string where a number belongs is rejected.
export function parseRestorableEntry(raw: unknown):
  { ok: true; value: RestorableEntry } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null) return { ok: false, error: "Nothing to restore." };
  const r = raw as Record<string, unknown>;

  const bad = (what: string) => ({ ok: false as const, error: `Can't restore: invalid ${what}.` });
  if (!isInt(r.id)) return bad("id");
  if (r.foodId !== null && !isInt(r.foodId)) return bad("food");
  if (typeof r.eatenOn !== "string" || !isRealDay(r.eatenOn)) return bad("date");
  if (r.meal !== null && (typeof r.meal !== "string" || !isMeal(r.meal))) return bad("meal");
  if (typeof r.quantity !== "number" || !parseQuantity(String(r.quantity)).ok) return bad("servings");
  if (!isText(r.foodName, 200)) return bad("name");
  if (!isText(r.servingLabel, 200)) return bad("serving");
  if (!isAmount(r.calories) || !isAmount(r.proteinG) || !isAmount(r.carbsG) || !isAmount(r.fatG)) {
    return bad("nutrition");
  }
  if (typeof r.createdAt !== "string" || Number.isNaN(Date.parse(r.createdAt))) return bad("time");

  return {
    ok: true,
    value: {
      id: r.id,
      foodId: r.foodId as number | null,
      eatenOn: r.eatenOn,
      meal: r.meal as MealType | null,
      quantity: r.quantity,
      foodName: r.foodName,
      servingLabel: r.servingLabel,
      calories: r.calories,
      proteinG: r.proteinG,
      carbsG: r.carbsG,
      fatG: r.fatG,
      createdAt: r.createdAt,
    },
  };
}
