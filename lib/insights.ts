// The maths behind the Insights page. Pure (no database, no clock), so it is easy to test.
// Days are "YYYY-MM-DD" strings and all date arithmetic is UTC, so nothing shifts with timezone.

export type DayTotal = { day: string; calories: number; proteinG: number; carbsG: number; fatG: number };
export type SeriesDay = DayTotal & { logged: boolean };
export type GoalValues = { calories: number; proteinG: number; carbsG: number; fatG: number };

export const ON_TARGET_TOLERANCE = 0.1; // within 10% of the calorie goal

export function shiftDayStr(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

// `count` consecutive days ending at `end`, oldest first.
export function daysInRange(end: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => shiftDayStr(end, i - (count - 1)));
}

// One entry per day in `days`; days with nothing logged are zeros with logged = false.
export function buildSeries(days: string[], totals: DayTotal[]): SeriesDay[] {
  const byDay = new Map(totals.map((t) => [t.day, t]));
  return days.map((day) => {
    const t = byDay.get(day);
    return t ? { ...t, logged: true } : { day, calories: 0, proteinG: 0, carbsG: 0, fatG: 0, logged: false };
  });
}

// Inclusive at both edges. Compares the distance from the goal (with a tiny epsilon) instead of
// multiplying by (1 +/- tolerance), because floating point makes values exactly on the edge
// unreliable (e.g. 2000 * 1.05 is 2100.0000000000002).
export function isOnTarget(calories: number, goal: number, tolerance = ON_TARGET_TOLERANCE): boolean {
  if (!(goal > 0)) return false;
  return Math.abs(calories - goal) <= goal * tolerance + 1e-9;
}

export type Summary = {
  totalDays: number;
  loggedDays: number;
  avgCalories: number; // averages are over LOGGED days only
  avgProteinG: number;
  avgCarbsG: number;
  avgFatG: number;
  daysOnTarget: number;
};

export function summarize(series: SeriesDay[], goals: GoalValues): Summary {
  const logged = series.filter((d) => d.logged);
  const n = logged.length;
  const avg = (pick: (d: SeriesDay) => number) => (n === 0 ? 0 : logged.reduce((sum, d) => sum + pick(d), 0) / n);
  return {
    totalDays: series.length,
    loggedDays: n,
    avgCalories: avg((d) => d.calories),
    avgProteinG: avg((d) => d.proteinG),
    avgCarbsG: avg((d) => d.carbsG),
    avgFatG: avg((d) => d.fatG),
    daysOnTarget: logged.filter((d) => isOnTarget(d.calories, goals.calories)).length,
  };
}

// current: consecutive logged days ending at `end` (or at the day before, if `end` has nothing
// yet, so the streak doesn't read 0 first thing in the morning). longest: the best run overall.
export function computeStreaks(loggedDays: string[], end: string): { current: number; longest: number } {
  const set = new Set(loggedDays);

  let cursor = set.has(end) ? end : shiftDayStr(end, -1);
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    cursor = shiftDayStr(cursor, -1);
  }

  let longest = 0;
  for (const day of set) {
    if (set.has(shiftDayStr(day, -1))) continue; // not the start of a run
    let run = 0;
    for (let d = day; set.has(d); d = shiftDayStr(d, 1)) run += 1;
    longest = Math.max(longest, run);
  }
  return { current, longest };
}
