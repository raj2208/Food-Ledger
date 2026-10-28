import { connection } from "next/server";
import type { Food } from "@/generated/prisma/client";
import type { FoodKind } from "@/generated/prisma/enums";
import { getPrisma } from "./prisma";

export type { Food, FoodKind };

export type FoodInput = Omit<Food, "id" | "createdAt">;

// Opt out of prerendering so DB reads happen per request, not at build time.
export async function listFoods(): Promise<Food[]> {
  await connection();
  return getPrisma().food.findMany({ orderBy: { name: "asc" } });
}

export async function insertFood(input: FoodInput): Promise<void> {
  await getPrisma().food.create({ data: input });
}

export async function updateFoodRow(id: number, input: FoodInput): Promise<void> {
  await getPrisma().food.update({ where: { id }, data: input });
}

export async function deleteFoodRow(id: number): Promise<void> {
  await getPrisma().food.delete({ where: { id } });
}

export async function getFoodRow(id: number): Promise<Food | null> {
  return getPrisma().food.findUnique({ where: { id } });
}

export async function findFoodByBarcode(barcode: string): Promise<Food | null> {
  return getPrisma().food.findFirst({ where: { barcode }, orderBy: { id: "asc" } });
}
