import { connection } from "next/server";
import type { LogEntry } from "@/generated/prisma/client";
import { getPrisma } from "./prisma";
import type { Food } from "./foods";

export type { LogEntry };

// Values are per-serving snapshots; totals are per-serving * quantity.
export type DayTotals = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

// The DB column is a DATE; pin the JS Date to UTC midnight so it never shifts a day.
function dayToDate(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

export async function listEntriesForDay(day: string): Promise<LogEntry[]> {
  await connection();
  return getPrisma().logEntry.findMany({
    where: { eatenOn: dayToDate(day) },
    orderBy: { id: "asc" },
  });
}

export function totalsFor(entries: LogEntry[]): DayTotals {
  return entries.reduce<DayTotals>(
    (t, e) => ({
      calories: t.calories + e.calories * e.quantity,
      proteinG: t.proteinG + e.proteinG * e.quantity,
      carbsG: t.carbsG + e.carbsG * e.quantity,
      fatG: t.fatG + e.fatG * e.quantity,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}

export async function insertEntry(
  food: Food,
  day: string,
  quantity: number,
): Promise<void> {
  await getPrisma().logEntry.create({
    data: {
      foodId: food.id,
      eatenOn: dayToDate(day),
      quantity,
      foodName: food.name,
      servingLabel: food.servingLabel,
      calories: food.calories,
      proteinG: food.proteinG,
      carbsG: food.carbsG,
      fatG: food.fatG,
    },
  });
}

export async function deleteEntryRow(id: number): Promise<void> {
  await getPrisma().logEntry.delete({ where: { id } });
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
