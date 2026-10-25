import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { logFood } from "@/app/actions";
import { DaySummary } from "@/components/day-summary";
import { buttonClass, inputClass } from "@/components/food-fields";
import { Hero } from "@/components/hero";
import { MealCard } from "@/components/meal-card";
import { Button } from "@/components/ui/button";
import { dayLabel } from "@/lib/calendar";
import { listFoods, type Food } from "@/lib/foods";
import { getGoals, recommendedRange } from "@/lib/goals";
import {
  isMeal,
  isValidDay,
  listEntriesForDay,
  listFrequentFoods,
  mealForNow,
  MEALS,
  shiftDay,
  todayLocal,
  totalsFor,
  type MealType,
} from "@/lib/log";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Day searchParams={searchParams} />
    </Suspense>
  );
}

function href(day: string, meal: MealType): string {
  return `/?date=${day}&meal=${meal}`;
}

const navButton =
  "flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground";

async function Day({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  await connection(); // "today" and the default meal depend on the request time
  const { date, meal: mealParam } = await searchParams;
  const requested = typeof date === "string" ? date : "";
  const day = isValidDay(requested) ? requested : todayLocal();
  const meal: MealType =
    typeof mealParam === "string" && isMeal(mealParam) ? mealParam : mealForNow();

  const [entries, foods, frequent, goals] = await Promise.all([
    listEntriesForDay(day),
    listFoods(),
    listFrequentFoods(),
    getGoals(),
  ]);
  const totals = totalsFor(entries);
  const isToday = day === todayLocal();
  const unassigned = entries.filter((e) => e.meal === null);

  return (
    <div className="flex flex-col gap-6">
      <Hero />

      <DaySummary totals={totals} goals={goals} />

      <nav className="flex items-center justify-between">
        <Link href={href(shiftDay(day, -1), meal)} aria-label="Previous day" className={navButton}>
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Link>
        <Link
          href={`/calendar?month=${day.slice(0, 7)}`}
          className="flex items-center gap-2 font-medium hover:underline"
        >
          <CalendarDays className="size-4" aria-hidden="true" />
          {dayLabel(day, isToday)}
        </Link>
        <Link href={href(shiftDay(day, 1), meal)} aria-label="Next day" className={navButton}>
          <ChevronRight className="size-5" aria-hidden="true" />
        </Link>
      </nav>

      <div className="flex flex-col gap-4">
        {MEALS.map((m) => (
          <MealCard
            key={m.value}
            meal={m.value}
            title={m.label}
            recommended={recommendedRange(m.value, goals.calories)}
            entries={entries.filter((e) => e.meal === m.value)}
            isOpen={m.value === meal}
            addHref={href(day, m.value)}
          >
            <LogControls day={day} meal={meal} foods={foods} frequent={frequent} />
          </MealCard>
        ))}
        {/* Entries logged before meals existed. */}
        {unassigned.length > 0 ? (
          <MealCard meal={null} title="Unassigned" entries={unassigned} />
        ) : null}
      </div>
    </div>
  );
}

function LogControls({
  day,
  meal,
  foods,
  frequent,
}: {
  day: string;
  meal: MealType;
  foods: Food[];
  frequent: Food[];
}) {
  if (foods.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You haven&apos;t saved any foods yet.{" "}
        <Link href="/foods" className="underline">
          Add one
        </Link>{" "}
        to start logging.
      </p>
    );
  }
  return (
    <>
      {frequent.length > 0 ? (
        <div className="mb-5">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Quick add · 1 serving</div>
          <div className="flex flex-wrap gap-2">
            {frequent.map((f) => (
              <form key={f.id} action={logFood}>
                <input type="hidden" name="day" value={day} />
                <input type="hidden" name="meal" value={meal} />
                <input type="hidden" name="food_id" value={f.id} />
                <input type="hidden" name="quantity" value="1" />
                <Button type="submit" variant="outline">
                  {f.name} · {Math.round(f.calories)} kcal
                </Button>
              </form>
            ))}
          </div>
        </div>
      ) : null}
      <form action={logFood} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="day" value={day} />
        <input type="hidden" name="meal" value={meal} />
        <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-medium text-muted-foreground">
          Food
          <select name="food_id" required className={inputClass}>
            {foods.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.servingLabel} · {Math.round(f.calories)} kcal)
              </option>
            ))}
          </select>
        </label>
        <label className="flex w-28 flex-col gap-1 text-xs font-medium text-muted-foreground">
          Servings
          <input
            name="quantity"
            type="number"
            min="0.01"
            step="any"
            defaultValue={1}
            required
            className={inputClass}
          />
        </label>
        <button type="submit" className={buttonClass}>
          Add to {MEALS.find((m) => m.value === meal)?.label.toLowerCase()}
        </button>
      </form>
    </>
  );
}
