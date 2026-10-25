import { connection } from "next/server";
import type { LogEntry } from "@/generated/prisma/client";
import type { MealType } from "@/generated/prisma/enums";
import { getPrisma } from "./prisma";
import type { Food } from "./foods";

export type { LogEntry, MealType };

export const MEALS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

export function isMeal(s: string): s is MealType {
  return MEALS.some((m) => m.value === s);
}

// Sensible default for "what am I eating now": before 11 breakfast, before 16 lunch, else dinner.
export function mealForNow(now = new Date()): MealType {
  const hour = now.getHours();
  return hour < 11 ? "breakfast" : hour < 16 ? "lunch" : "dinner";
}

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

// Calories per day ("YYYY-MM-DD" -> kcal) for a "YYYY-MM" month. Days with no logs are absent.
export async function listDayCaloriesForMonth(
  month: string,
): Promise<Record<string, number>> {
  await connection();
  const [y, m] = month.split("-").map(Number);
  const rows = await getPrisma().logEntry.findMany({
    where: {
      eatenOn: {
        gte: new Date(Date.UTC(y, m - 1, 1)),
        lt: new Date(Date.UTC(y, m, 1)),
      },
    },
    select: { eatenOn: true, calories: true, quantity: true },
  });
  const byDay: Record<string, number> = {};
  for (const r of rows) {
    const day = r.eatenOn.toISOString().slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + r.calories * r.quantity;
  }
  return byDay;
}

// The foods you log most, so repeat meals are one tap away.
export async function listFrequentFoods(limit = 5): Promise<Food[]> {
  await connection();
  const prisma = getPrisma();
  const groups = await prisma.logEntry.groupBy({
    by: ["foodId"],
    where: { foodId: { not: null } },
    _count: { _all: true },
    orderBy: [{ _count: { foodId: "desc" } }, { foodId: "asc" }],
    take: limit,
  });
  const ids = groups.flatMap((g) => (g.foodId === null ? [] : [g.foodId]));
  const foods = await prisma.food.findMany({ where: { id: { in: ids } } });
  const byId = new Map(foods.map((f) => [f.id, f]));
  return ids.flatMap((id) => byId.get(id) ?? []);
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
  meal: MealType,
  quantity: number,
): Promise<void> {
  await getPrisma().logEntry.create({
    data: {
      foodId: food.id,
      eatenOn: dayToDate(day),
      meal,
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
