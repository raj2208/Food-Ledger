import { connection } from "next/server";
import { getPrisma } from "./prisma";
import type { DayTotal } from "./insights";

const toDate = (day: string) => new Date(`${day}T00:00:00Z`);
const toDay = (d: Date) => d.toISOString().slice(0, 10);

// Calories and macros per day (servings x per-serving values) for days from..to inclusive.
// Days with no entries are absent from the result.
export async function listDailyTotals(from: string, to: string): Promise<DayTotal[]> {
  await connection();
  const rows = await getPrisma().logEntry.findMany({
    where: { eatenOn: { gte: toDate(from), lte: toDate(to) } },
    select: { eatenOn: true, quantity: true, calories: true, proteinG: true, carbsG: true, fatG: true },
  });
  const byDay = new Map<string, DayTotal>();
  for (const r of rows) {
    const day = toDay(r.eatenOn);
    const t = byDay.get(day) ?? { day, calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
    t.calories += r.calories * r.quantity;
    t.proteinG += r.proteinG * r.quantity;
    t.carbsG += r.carbsG * r.quantity;
    t.fatG += r.fatG * r.quantity;
    byDay.set(day, t);
  }
  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
}

// Every day from..to that has at least one entry (for streaks).
export async function listLoggedDays(from: string, to: string): Promise<string[]> {
  await connection();
  const groups = await getPrisma().logEntry.groupBy({
    by: ["eatenOn"],
    where: { eatenOn: { gte: toDate(from), lte: toDate(to) } },
  });
  return groups.map((g) => toDay(g.eatenOn));
}
