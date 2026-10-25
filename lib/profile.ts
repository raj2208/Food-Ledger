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
