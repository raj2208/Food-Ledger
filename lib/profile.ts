// Pure helpers for the profile page (no database, so they are easy to test).

// A DATE column comes back as a Date at UTC midnight, so read its parts in UTC.
export function ageFrom(dateOfBirth: Date, now = new Date()): number {
  let age = now.getFullYear() - dateOfBirth.getUTCFullYear();
  const beforeBirthday =
    now.getMonth() < dateOfBirth.getUTCMonth() ||
    (now.getMonth() === dateOfBirth.getUTCMonth() && now.getDate() < dateOfBirth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export type ProfileInput = {
  name: string;
  email: string;
  dateOfBirth: string | null; // "YYYY-MM-DD"
  heightCm: number | null;
  weightKg: number | null;
};

// What the form posts: trimmed strings, empty when left blank.
export type RawProfile = {
  name: string;
  email: string;
  dateOfBirth: string;
  heightCm: string;
  weightKg: string;
};

// Errors are keyed by the form input's `name`, and report every bad field at once.
export type ProfileResult =
  | { ok: true; value: ProfileInput }
  | { ok: false; fieldErrors: Record<string, string> };

export const PROFILE_LIMITS = {
  heightCm: { min: 50, max: 272 },
  weightKg: { min: 2, max: 650 },
  earliestBirthDate: "1900-01-01",
} as const;

function isRealDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function optionalNumber(raw: string, label: string, min: number, max: number, unit: string):
  { ok: true; value: number | null } | { ok: false; error: string } {
  if (raw === "") return { ok: true, value: null };
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) {
    return { ok: false, error: `${label} must be between ${min} and ${max} ${unit}` };
  }
  return { ok: true, value: n };
}

// `today` is "YYYY-MM-DD" in the user's local day, passed in so this stays pure and testable.
export function parseProfile(raw: RawProfile, today: string): ProfileResult {
  const fieldErrors: Record<string, string> = {};

  const name = raw.name.trim();
  if (name === "") fieldErrors.name = "Name is required";
  else if (name.length > 100) fieldErrors.name = "Name must be 100 characters or fewer";

  const email = raw.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Enter a valid email address";
  }

  let dateOfBirth: string | null = null;
  if (raw.dateOfBirth !== "") {
    if (!isRealDate(raw.dateOfBirth)) {
      fieldErrors.date_of_birth = "Enter a valid date of birth";
    } else if (raw.dateOfBirth < PROFILE_LIMITS.earliestBirthDate || raw.dateOfBirth > today) {
      fieldErrors.date_of_birth = "Date of birth must be between 1900 and today";
    } else {
      dateOfBirth = raw.dateOfBirth;
    }
  }

  const h = PROFILE_LIMITS.heightCm;
  const height = optionalNumber(raw.heightCm, "Height", h.min, h.max, "cm");
  if (!height.ok) fieldErrors.height_cm = height.error;
  const w = PROFILE_LIMITS.weightKg;
  const weight = optionalNumber(raw.weightKg, "Weight", w.min, w.max, "kg");
  if (!weight.ok) fieldErrors.weight_kg = weight.error;

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return {
    ok: true,
    value: {
      name,
      email,
      dateOfBirth,
      heightCm: height.ok ? height.value : null,
      weightKg: weight.ok ? weight.value : null,
    },
  };
}

// "YYYY-MM-DD" <-> a local-time Date, for the date picker. Built from parts, never from
// toISOString(), so the chosen day can't shift by a timezone.
export function stringToDate(s: string | null | undefined): Date | undefined {
  if (!s || !isRealDate(s)) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dateToString(d: Date): string {
  const y = String(d.getFullYear()).padStart(4, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
