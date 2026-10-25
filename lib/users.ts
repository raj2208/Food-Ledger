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
