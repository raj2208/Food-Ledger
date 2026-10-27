import { connection } from "next/server";
import { cache } from "react";
import type { User } from "@/generated/prisma/client";
import { getPrisma } from "./prisma";

export type { User };

// No login yet, so "the current user" is simply the first (and only) user.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  await connection();
  return getPrisma().user.findFirst({ orderBy: { id: "asc" } });
});

export async function updateUserRow(
  id: number,
  input: {
    name: string;
    email: string;
    dateOfBirth: string | null;
    heightCm: number | null;
    weightKg: number | null;
  },
): Promise<void> {
  await getPrisma().user.update({
    where: { id },
    data: {
      name: input.name,
      email: input.email,
      // A DATE column: pin to UTC midnight so it never shifts a day.
      dateOfBirth: input.dateOfBirth ? new Date(`${input.dateOfBirth}T00:00:00Z`) : null,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
    },
  });
}

// Postgres/Prisma "unique constraint failed" (P2002), e.g. an email another user already has.
export function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "P2002";
}
