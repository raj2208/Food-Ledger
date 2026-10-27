// Rules for the add/edit food form. No database imports, so it is easy to test.
export type FoodKindValue = "homemade" | "packaged";

// What the form posts: trimmed strings, empty when left blank. Keys match the input names.
export type FoodRaw = {
  name: string;
  kind: string;
  serving_label: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  barcode: string;
  notes: string;
};

export type FoodValue = {
  name: string;
  kind: FoodKindValue;
  barcode: string | null;
  servingLabel: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  notes: string | null;
};

export const FOOD_LIMITS = {
  name: 100,
  serving: 50,
  barcode: 32,
  notes: 300,
  calories: 10000, // per serving
  macro: 2000, // grams per serving
} as const;

export type FoodResult =
  | { ok: true; value: FoodValue }
  | { ok: false; fieldErrors: Record<string, string> };

function number(raw: string, max: number, label: string, required: boolean): { value: number } | { error: string } {
  if (raw === "") return required ? { error: "Required" } : { value: 0 };
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > max) return { error: `${label} must be between 0 and ${max}` };
  return { value: n };
}

// Reports every problem at once so the form can mark each field.
export function parseFoodInput(raw: FoodRaw): FoodResult {
  const L = FOOD_LIMITS;
  const fieldErrors: Record<string, string> = {};

  if (raw.name === "") fieldErrors.name = "Name is required";
  else if (raw.name.length > L.name) fieldErrors.name = `Name must be ${L.name} characters or fewer`;

  if (raw.kind !== "homemade" && raw.kind !== "packaged") fieldErrors.kind = "Pick a type";

  const servingLabel = raw.serving_label === "" ? "1 serving" : raw.serving_label;
  if (servingLabel.length > L.serving) fieldErrors.serving_label = `Serving must be ${L.serving} characters or fewer`;

  const calories = number(raw.calories, L.calories, "Calories", true);
  const protein = number(raw.protein_g, L.macro, "Protein", false);
  const carbs = number(raw.carbs_g, L.macro, "Carbs", false);
  const fat = number(raw.fat_g, L.macro, "Fat", false);
  if ("error" in calories) fieldErrors.calories = calories.error;
  if ("error" in protein) fieldErrors.protein_g = protein.error;
  if ("error" in carbs) fieldErrors.carbs_g = carbs.error;
  if ("error" in fat) fieldErrors.fat_g = fat.error;

  if (raw.barcode.length > L.barcode) fieldErrors.barcode = `Barcode must be ${L.barcode} characters or fewer`;
  if (raw.notes.length > L.notes) fieldErrors.notes = `Notes must be ${L.notes} characters or fewer`;

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return {
    ok: true,
    value: {
      name: raw.name,
      kind: raw.kind as FoodKindValue,
      barcode: raw.barcode === "" ? null : raw.barcode,
      servingLabel,
      calories: (calories as { value: number }).value,
      proteinG: (protein as { value: number }).value,
      carbsG: (carbs as { value: number }).value,
      fatG: (fat as { value: number }).value,
      notes: raw.notes === "" ? null : raw.notes,
    },
  };
}
