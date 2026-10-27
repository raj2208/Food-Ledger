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
