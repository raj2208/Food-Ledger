// Months are "YYYY-MM" strings and days "YYYY-MM-DD". All math is UTC so a day
// never shifts with the viewer's timezone.

export function isValidMonth(s: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
}

function parts(month: string): [number, number] {
  const [y, m] = month.split("-").map(Number);
  return [y, m];
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = parts(month);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(month: string): string {
  const [y, m] = parts(month);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// "Today, Oct 25" for today, otherwise "Mon, Oct 26".
export function dayLabel(day: string, isToday: boolean): string {
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const date = dt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  if (isToday) return `Today, ${date}`;
  const weekday = dt.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  return `${weekday}, ${date}`;
}

// "Oct 21" for any "YYYY-MM-DD".
export function shortDate(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Weeks start on Monday. Cells before the 1st and after the last day are null.
export function buildMonthGrid(month: string): (string | null)[] {
  const [y, m] = parts(month);
  const leading = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const cells: (string | null)[] = Array(leading).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${month}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
