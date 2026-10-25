import { connection } from "next/server";
import { getDb } from "./db";

export type FoodKind = "homemade" | "packaged";

export type Food = {
  id: number;
  name: string;
  kind: FoodKind;
  barcode: string | null;
  serving_label: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type FoodInput = Omit<Food, "id">;

// Sync SQLite reads would otherwise run during prerender, so opt out first.
export async function listFoods(): Promise<Food[]> {
  await connection();
  return getDb()
    .prepare("SELECT * FROM foods ORDER BY name COLLATE NOCASE")
    .all() as Food[];
}

export function insertFood(input: FoodInput): void {
  getDb()
    .prepare(
      `INSERT INTO foods (name, kind, barcode, serving_label, calories, protein_g, carbs_g, fat_g)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.name,
      input.kind,
      input.barcode,
      input.serving_label,
      input.calories,
      input.protein_g,
      input.carbs_g,
      input.fat_g,
    );
}

export function updateFoodRow(id: number, input: FoodInput): void {
  getDb()
    .prepare(
      `UPDATE foods
       SET name = ?, kind = ?, barcode = ?, serving_label = ?,
           calories = ?, protein_g = ?, carbs_g = ?, fat_g = ?
       WHERE id = ?`,
    )
    .run(
      input.name,
      input.kind,
      input.barcode,
      input.serving_label,
      input.calories,
      input.protein_g,
      input.carbs_g,
      input.fat_g,
      id,
    );
}

export function deleteFoodRow(id: number): void {
  getDb().prepare("DELETE FROM foods WHERE id = ?").run(id);
}

export function getFoodRow(id: number): Food | undefined {
  return getDb().prepare("SELECT * FROM foods WHERE id = ?").get(id) as
    | Food
    | undefined;
}
