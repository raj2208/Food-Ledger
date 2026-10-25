import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { deleteEntry, logFood } from "@/app/actions";
import { buttonClass, ghostButtonClass, inputClass } from "@/components/food-fields";
import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { listFoods } from "@/lib/foods";
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
  type LogEntry,
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

async function Day({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  await connection(); // "today" and the default meal depend on the request time
  const { date, meal: mealParam } = await searchParams;
  const requested = typeof date === "string" ? date : "";
  const day = isValidDay(requested) ? requested : todayLocal();
  const meal: MealType =
    typeof mealParam === "string" && isMeal(mealParam) ? mealParam : mealForNow();

  const [entries, foods, frequent] = await Promise.all([
    listEntriesForDay(day),
    listFoods(),
    listFrequentFoods(),
  ]);
  const totals = totalsFor(entries);
  const isToday = day === todayLocal();

  return (
    <div className="flex flex-col gap-8">
      <Hero />

      <nav className="flex items-center justify-between">
        <Link href={href(shiftDay(day, -1), meal)} className={ghostButtonClass}>
          ← Prev
        </Link>
        <div className="text-center">
          <div className="font-semibold">{isToday ? "Today" : day}</div>
          {isToday ? <div className="text-xs text-muted-foreground">{day}</div> : null}
        </div>
        <Link href={href(shiftDay(day, 1), meal)} className={ghostButtonClass}>
          Next →
        </Link>
      </nav>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="text-3xl font-semibold tabular-nums">
          {Math.round(totals.calories)}{" "}
          <span className="text-base font-normal text-muted-foreground">kcal</span>
        </div>
        <div className="mt-1 flex gap-4 text-sm text-muted-foreground tabular-nums">
          <span>Protein {Math.round(totals.proteinG)} g</span>
          <span>Carbs {Math.round(totals.carbsG)} g</span>
          <span>Fat {Math.round(totals.fatG)} g</span>
        </div>
      </section>

      <section id="log-food" className="scroll-mt-6">
        <h2 className="mb-3 text-lg font-semibold">Log food</h2>

        <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1" role="tablist">
          {MEALS.map((m) => (
            <Link
              key={m.value}
              href={href(day, m.value)}
              role="tab"
              aria-selected={m.value === meal}
              className={`flex-1 rounded-md px-3 py-1.5 text-center text-sm ${
                m.value === meal
                  ? "bg-primary font-medium text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </Link>
          ))}
        </div>

        {foods.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t saved any foods yet.{" "}
            <Link href="/foods" className="underline">
              Add one
            </Link>{" "}
            to start logging.
          </p>
        ) : (
          <>
            {frequent.length > 0 ? (
              <div className="mb-5">
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  Quick add · 1 serving
                </div>
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
        )}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="-mb-3 text-lg font-semibold">Eaten</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing logged for this day.</p>
        ) : (
          <>
            {MEALS.map((m) => (
              <MealGroup
                key={m.value}
                title={m.label}
                entries={entries.filter((e) => e.meal === m.value)}
              />
            ))}
            {/* Entries logged before meals existed. */}
            <MealGroup title="Unassigned" entries={entries.filter((e) => e.meal === null)} />
          </>
        )}
      </section>
    </div>
  );
}

function MealGroup({ title, entries }: { title: string; entries: LogEntry[] }) {
  if (entries.length === 0) return null;
  const kcal = totalsFor(entries).calories;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs tabular-nums text-muted-foreground">{Math.round(kcal)} kcal</span>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {entries.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-4 py-2">
            <div>
              <div>{e.foodName}</div>
              <div className="text-xs text-muted-foreground">
                {e.quantity} × {e.servingLabel}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm tabular-nums">
                {Math.round(e.calories * e.quantity)} kcal
              </span>
              <form action={deleteEntry.bind(null, e.id)}>
                <button type="submit" className={ghostButtonClass}>
                  Remove
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
