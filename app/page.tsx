import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { logFood } from "@/app/actions";
import { ActionForm, FieldErrorMessage, FormInput, SubmitButton } from "@/components/action-form";
import { DaySummary } from "@/components/day-summary";
import { MealCard } from "@/components/meal-card";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { dayLabel } from "@/lib/calendar";
import { listFoods, type Food } from "@/lib/foods";
import { getGoals, recommendedRange } from "@/lib/goals";
import {
  isMeal,
  isValidDay,
  listEntriesForDay,
  listFrequentFoods,
  MEALS,
  shiftDay,
  todayLocal,
  totalsFor,
  type MealType,
} from "@/lib/log";

type Params = PageProps<"/">["searchParams"];

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <PageShell
      hero={
        <Suspense fallback={<Skeleton className="h-80 w-full bg-white/30 dark:bg-black/20" />}>
          <Summary searchParams={searchParams} />
        </Suspense>
      }
    >
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <Day searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}

// `meal` is the card to keep open; leave it out for a page with every card closed.
function href(day: string, meal?: MealType | null): string {
  return meal ? `/?date=${day}&meal=${meal}` : `/?date=${day}`;
}

// Which day is showing, and which meal card (if any) is open. Every card starts closed.
// Needs the request time for "today", so it opts out of prerendering.
async function resolveView(searchParams: Params) {
  await connection();
  const { date, meal: mealParam } = await searchParams;
  const requested = typeof date === "string" ? date : "";
  const day = isValidDay(requested) ? requested : todayLocal();
  const openMeal: MealType | null =
    typeof mealParam === "string" && isMeal(mealParam) ? mealParam : null;
  return { day, openMeal, isToday: day === todayLocal() };
}

// Rendered inside the gradient band in PageShell.
async function Summary({ searchParams }: { searchParams: Params }) {
  const { day } = await resolveView(searchParams);
  const [entries, goals] = await Promise.all([listEntriesForDay(day), getGoals()]);
  return <DaySummary totals={totalsFor(entries)} goals={goals} />;
}

async function Day({ searchParams }: { searchParams: Params }) {
  const { day, openMeal, isToday } = await resolveView(searchParams);
  const [entries, foods, frequent, goals] = await Promise.all([
    listEntriesForDay(day),
    listFoods(),
    listFrequentFoods(),
    getGoals(),
  ]);
  const unassigned = entries.filter((e) => e.meal === null);

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center justify-between">
        <Button
          render={<Link href={href(shiftDay(day, -1), openMeal)} />}
          nativeButton={false}
          variant="ghost"
          size="icon"
          aria-label="Previous day"
        >
          <ChevronLeft />
        </Button>
        <Button
          render={<Link href={`/calendar?month=${day.slice(0, 7)}`} />}
          nativeButton={false}
          variant="ghost"
        >
          <CalendarDays data-icon="inline-start" />
          {dayLabel(day, isToday)}
        </Button>
        <Button
          render={<Link href={href(shiftDay(day, 1), openMeal)} />}
          nativeButton={false}
          variant="ghost"
          size="icon"
          aria-label="Next day"
        >
          <ChevronRight />
        </Button>
      </nav>

      <div className="flex flex-col gap-4">
        {MEALS.map((m) => {
          const isOpen = m.value === openMeal;
          return (
            <MealCard
              key={m.value}
              meal={m.value}
              title={m.label}
              recommended={recommendedRange(m.value, goals.calories)}
              entries={entries.filter((e) => e.meal === m.value)}
              isOpen={isOpen}
              toggleHref={href(day, isOpen ? null : m.value)}
            >
              <LogControls day={day} meal={m.value} foods={foods} frequent={frequent} />
            </MealCard>
          );
        })}
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

  const foodItems = foods.map((f) => ({
    value: String(f.id),
    label: `${f.name} (${f.servingLabel} · ${Math.round(f.calories)} kcal)`,
  }));
  const mealLabel = MEALS.find((m) => m.value === meal)?.label.toLowerCase();

  return (
    <div className="flex flex-col gap-5">
      {frequent.length > 0 ? (
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">Quick add · 1 serving</div>
          <div className="flex flex-wrap gap-2">
            {frequent.map((f) => (
              <ActionForm key={f.id} action={logFood} errorsAs="toast">
                <input type="hidden" name="day" value={day} />
                <input type="hidden" name="meal" value={meal} />
                <input type="hidden" name="food_id" value={f.id} />
                <input type="hidden" name="quantity" value="1" />
                <SubmitButton variant="outline" pendingLabel="Adding…">
                  {f.name} · {Math.round(f.calories)} kcal
                </SubmitButton>
              </ActionForm>
            ))}
          </div>
        </div>
      ) : null}

      <ActionForm action={logFood} resetOnSuccess className="flex flex-col gap-3">
        <input type="hidden" name="day" value={day} />
        <input type="hidden" name="meal" value={meal} />
        <div className="flex flex-wrap items-start gap-3">
          <Field className="min-w-48 flex-1">
            <FieldLabel htmlFor={`${meal}-food`}>Food</FieldLabel>
            <Select name="food_id" required items={foodItems} defaultValue={foodItems[0].value}>
              <SelectTrigger id={`${meal}-food`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {foodItems.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldErrorMessage id={`${meal}-food`} name="food_id" />
          </Field>
          <Field className="w-28">
            <FieldLabel htmlFor={`${meal}-quantity`}>Servings</FieldLabel>
            <FormInput
              id={`${meal}-quantity`}
              name="quantity"
              type="number"
              min="0.01"
              step="any"
              defaultValue={1}
              required
            />
            <FieldErrorMessage id={`${meal}-quantity`} name="quantity" />
          </Field>
        </div>
        <div>
          <SubmitButton pendingLabel="Adding…">Add to {mealLabel}</SubmitButton>
        </div>
      </ActionForm>
    </div>
  );
}
