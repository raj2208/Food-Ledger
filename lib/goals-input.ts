// Rules for the daily goals form. No database imports, so it is easy to test.
export type GoalsRaw = { calories: string; carbs_g: string; protein_g: string; fat_g: string };
export type GoalsValue = { calories: number; carbsG: number; proteinG: number; fatG: number };

export const GOAL_LIMITS = {
  calories: { min: 1, max: 20000 },
  macro: { min: 0, max: 5000 },
} as const;

export type GoalsResult =
  | { ok: true; value: GoalsValue }
  | { ok: false; fieldErrors: Record<string, string> };

function parseField(raw: string, min: number, max: number, label: string): { value: number } | { error: string } {
  if (raw === "") return { error: "Required" };
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) {
    return { error: `${label} must be between ${min} and ${max}` };
  }
  return { value: n };
}

// Reports every problem at once (not just the first) so the form can mark each field.
export function parseGoals(raw: GoalsRaw): GoalsResult {
  const c = GOAL_LIMITS.calories;
  const m = GOAL_LIMITS.macro;
  const calories = parseField(raw.calories, c.min, c.max, "Calories");
  const carbs = parseField(raw.carbs_g, m.min, m.max, "Carbs");
  const protein = parseField(raw.protein_g, m.min, m.max, "Protein");
  const fat = parseField(raw.fat_g, m.min, m.max, "Fat");

  const fieldErrors: Record<string, string> = {};
  if ("error" in calories) fieldErrors.calories = calories.error;
  if ("error" in carbs) fieldErrors.carbs_g = carbs.error;
  if ("error" in protein) fieldErrors.protein_g = protein.error;
  if ("error" in fat) fieldErrors.fat_g = fat.error;
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    value: {
      calories: (calories as { value: number }).value,
      carbsG: (carbs as { value: number }).value,
      proteinG: (protein as { value: number }).value,
      fatG: (fat as { value: number }).value,
    },
  };
}
