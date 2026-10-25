import { connection } from "next/server";
import { cache } from "react";
import type { MealType } from "@/generated/prisma/enums";
import { getPrisma } from "./prisma";

export type Goals = {
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
};

export const DEFAULT_GOALS: Goals = {
  calories: 2000,
  carbsG: 250,
  proteinG: 100,
  fatG: 70,
};

const GOALS_ID = 1;

// cache(): the page reads goals in two places; this runs the query once per request.
export const getGoals = cache(async (): Promise<Goals> => {
  await connection();
  const row = await getPrisma().dailyGoals.findUnique({ where: { id: GOALS_ID } });
  if (!row) return DEFAULT_GOALS;
  return {
    calories: row.calories,
    carbsG: row.carbsG,
    proteinG: row.proteinG,
    fatG: row.fatG,
  };
});

export async function saveGoalsRow(goals: Goals): Promise<void> {
  await getPrisma().dailyGoals.upsert({
    where: { id: GOALS_ID },
    create: { id: GOALS_ID, ...goals },
    update: goals,
  });
}

// Rule of thumb: the three meals cover ~90-105% of the day, leaving room for snacks.
const MEAL_SHARE: Record<MealType, [number, number]> = {
  breakfast: [0.25, 0.3],
  lunch: [0.35, 0.4],
  dinner: [0.3, 0.35],
};

const roundTo5 = (n: number) => Math.round(n / 5) * 5;

export function recommendedRange(meal: MealType, calorieGoal: number): [number, number] {
  const [lo, hi] = MEAL_SHARE[meal];
  return [roundTo5(calorieGoal * lo), roundTo5(calorieGoal * hi)];
}
