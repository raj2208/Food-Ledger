import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ghostButtonClass } from "@/components/food-fields";
import {
  buildMonthGrid,
  isValidMonth,
  monthLabel,
  shiftMonth,
  WEEKDAYS,
} from "@/lib/calendar";
import { listDayCaloriesForMonth, todayLocal } from "@/lib/log";

export const metadata = { title: "Calendar · Food Ledger" };

export default function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
      <Month searchParams={searchParams} />
    </Suspense>
  );
}

async function Month({
  searchParams,
}: {
  searchParams: PageProps<"/calendar">["searchParams"];
}) {
  await connection(); // "today" depends on the request time
  const { month } = await searchParams;
  const requested = typeof month === "string" ? month : "";
  const today = todayLocal();
  const current = isValidMonth(requested) ? requested : today.slice(0, 7);

  const byDay = await listDayCaloriesForMonth(current);
  const loggedDays = Object.keys(byDay).length;
  const total = Object.values(byDay).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center justify-between">
        <Link href={`/calendar?month=${shiftMonth(current, -1)}`} className={ghostButtonClass}>
          ← Prev
        </Link>
        <div className="text-center">
          <div className="font-semibold">{monthLabel(current)}</div>
          <div className="text-xs text-zinc-500">
            {loggedDays === 0
              ? "No days logged"
              : `${loggedDays} ${loggedDays === 1 ? "day" : "days"} logged · avg ${Math.round(total / loggedDays)} kcal`}
          </div>
        </div>
        <Link href={`/calendar?month=${shiftMonth(current, 1)}`} className={ghostButtonClass}>
          Next →
        </Link>
      </nav>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-500">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="-mt-3 grid grid-cols-7 gap-1">
        {buildMonthGrid(current).map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;
          const kcal = byDay[day];
          const isToday = day === today;
          return (
            <Link
              key={day}
              href={`/?date=${day}`}
              className={`flex aspect-square flex-col justify-between rounded-md border p-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                isToday
                  ? "border-zinc-900 dark:border-zinc-100"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <span className={isToday ? "font-semibold" : ""}>{Number(day.slice(8))}</span>
              {kcal !== undefined ? (
                <span className="text-[10px] leading-tight tabular-nums text-zinc-500 sm:text-xs">
                  {Math.round(kcal)}
                  <span className="hidden sm:inline"> kcal</span>
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
