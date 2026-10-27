import type { RestorableEntry } from "./meals";

// What a form's server action returns instead of throwing: either success, or an error
// message plus (optionally) a message per field, keyed by the input's `name`.
export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const succeed = (message?: string): ActionResult => ({ ok: true, message });

export const fail = (error: string, fieldErrors?: Record<string, string>): ActionResult => ({
  ok: false,
  error,
  fieldErrors,
});

// Returned by "remove": on success it carries a full copy of the entry so Undo can put it back.
export type RemoveResult = { ok: true; entry: RestorableEntry } | { ok: false; error: string };

// Postgres/Prisma "unique constraint failed" (P2002), e.g. an email already taken.
export function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "P2002";
}
