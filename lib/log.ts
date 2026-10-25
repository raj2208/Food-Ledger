import { connection } from "next/server";
import { getDb } from "./db";
import type { Food } from "./foods";

// Values are per-serving snapshots; totals are per-serving * quantity.
export type LogEntry = {
  id: number;
  food_id: number | null;
  eaten_on: string;
  quantity: number;
  food_name: string;
  serving_label: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type DayTotals = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export async function listEntriesForDay(day: string): Promise<LogEntry[]> {
  await connection();
  return getDb()
    .prepare("SELECT * FROM log_entries WHERE eaten_on = ? ORDER BY id")
    .all(day) as LogEntry[];
}

export function totalsFor(entries: LogEntry[]): DayTotals {
  return entries.reduce<DayTotals>(
    (t, e) => ({
      calories: t.calories + e.calories * e.quantity,
      protein_g: t.protein_g + e.protein_g * e.quantity,
      carbs_g: t.carbs_g + e.carbs_g * e.quantity,
      fat_g: t.fat_g + e.fat_g * e.quantity,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  );
}

export function insertEntry(food: Food, day: string, quantity: number): void {
  getDb()
    .prepare(
      `INSERT INTO log_entries
         (food_id, eaten_on, quantity, food_name, serving_label, calories, protein_g, carbs_g, fat_g)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      food.id,
      day,
      quantity,
      food.name,
      food.serving_label,
      food.calories,
      food.protein_g,
      food.carbs_g,
      food.fat_g,
    );
}

export function deleteEntryRow(id: number): void {
  getDb().prepare("DELETE FROM log_entries WHERE id = ?").run(id);
}

export function todayLocal(): string {
  return formatDay(new Date());
}

export function formatDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isValidDay(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00`);
  return !Number.isNaN(d.getTime()) && formatDay(d) === s;
}

export function shiftDay(day: string, delta: number): string {
  const d = new Date(`${day}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return formatDay(d);
}
