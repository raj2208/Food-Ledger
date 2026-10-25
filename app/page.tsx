import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { deleteEntry, logFood } from "@/app/actions";
import { buttonClass, ghostButtonClass, inputClass } from "@/components/food-fields";
import { Button } from "@/components/ui/button";
import { listFoods } from "@/lib/foods";
import {
  isValidDay,
  listEntriesForDay,
  listFrequentFoods,
  shiftDay,
  todayLocal,
  totalsFor,
} from "@/lib/log";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
      <Day searchParams={searchParams} />
    </Suspense>
  );
}

async function Day({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  await connection(); // "today" depends on the request time
  const { date } = await searchParams;
  const requested = typeof date === "string" ? date : "";
  const day = isValidDay(requested) ? requested : todayLocal();

  const [entries, foods, frequent] = await Promise.all([
    listEntriesForDay(day),
    listFoods(),
    listFrequentFoods(),
  ]);
  const totals = totalsFor(entries);
  const isToday = day === todayLocal();

  return (
    <div className="flex flex-col gap-8">
      <nav className="flex items-center justify-between">
        <Link href={`/?date=${shiftDay(day, -1)}`} className={ghostButtonClass}>
          ← Prev
        </Link>
        <div className="text-center">
          <div className="font-semibold">{isToday ? "Today" : day}</div>
          {isToday ? <div className="text-xs text-zinc-500">{day}</div> : null}
        </div>
        <Link href={`/?date=${shiftDay(day, 1)}`} className={ghostButtonClass}>
          Next →
        </Link>
      </nav>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="text-3xl font-semibold tabular-nums">
          {Math.round(totals.calories)}{" "}
          <span className="text-base font-normal text-zinc-500">kcal</span>
        </div>
        <div className="mt-1 flex gap-4 text-sm text-zinc-500 tabular-nums">
          <span>Protein {Math.round(totals.proteinG)} g</span>
          <span>Carbs {Math.round(totals.carbsG)} g</span>
          <span>Fat {Math.round(totals.fatG)} g</span>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Log food</h2>
        {foods.length === 0 ? (
          <p className="text-sm text-zinc-500">
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
              <div className="mb-2 text-xs font-medium text-zinc-500">
                Quick add · 1 serving
              </div>
              <div className="flex flex-wrap gap-2">
                {frequent.map((f) => (
                  <form key={f.id} action={logFood}>
                    <input type="hidden" name="day" value={day} />
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
            <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-medium text-zinc-500">
              Food
              <select name="food_id" required className={inputClass}>
                {foods.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.servingLabel} · {Math.round(f.calories)} kcal)
                  </option>
                ))}
              </select>
            </label>
            <label className="flex w-28 flex-col gap-1 text-xs font-medium text-zinc-500">
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
              Add
            </button>
          </form>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Eaten</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing logged for this day.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {entries.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 py-2">
                <div>
                  <div>{e.foodName}</div>
                  <div className="text-xs text-zinc-500">
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
        )}
      </section>
    </div>
  );
}
