import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CaloriesChart, MacrosChart } from "@/components/insights-charts";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { shortDate } from "@/lib/calendar";
import { getGoals } from "@/lib/goals";
import { buildSeries, computeStreaks, daysInRange, shiftDayStr, summarize } from "@/lib/insights";
import { listDailyTotals, listLoggedDays } from "@/lib/insights-data";
import { isValidDay, todayLocal } from "@/lib/log";

export const metadata = { title: "Insights · Food Ledger" };

const RANGES = [7, 30] as const;
const STREAK_LOOKBACK_DAYS = 365;

export default function InsightsPage({ searchParams }: PageProps<"/insights">) {
  return (
    <PageShell>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <Insights searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}

// `end` is left out of the URL when it is today, so the default link stays clean.
function href(range: number, end: string, today: string): string {
  return end === today ? `/insights?range=${range}` : `/insights?range=${range}&end=${end}`;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

async function Insights({ searchParams }: { searchParams: PageProps<"/insights">["searchParams"] }) {
  await connection(); // "today" depends on the request time
  const { range: rangeParam, end: endParam } = await searchParams;
  const today = todayLocal();
  const range = rangeParam === "30" ? 30 : 7;
  const requestedEnd = typeof endParam === "string" && isValidDay(endParam) ? endParam : today;
  const end = requestedEnd > today ? today : requestedEnd; // no peeking into the future

  const days = daysInRange(end, range);
  const [totals, loggedDays, goals] = await Promise.all([
    listDailyTotals(days[0], end),
    listLoggedDays(shiftDayStr(end, -(STREAK_LOOKBACK_DAYS - 1)), end),
    getGoals(),
  ]);
  const series = buildSeries(days, totals);
  const summary = summarize(series, goals);
  const streaks = computeStreaks(loggedDays, end);

  const prevEnd = shiftDayStr(end, -range);
  const nextEndRaw = shiftDayStr(end, range);
  const nextEnd = nextEndRaw > today ? today : nextEndRaw;
  const atPresent = end === today;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1" role="group" aria-label="Range">
          {RANGES.map((r) => (
            <Button
              key={r}
              render={<Link href={href(r, end, today)} />}
              nativeButton={false}
              variant={r === range ? "default" : "outline"}
              size="sm"
              aria-current={r === range ? "true" : undefined}
            >
              {r} days
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            render={<Link href={href(range, prevEnd, today)} />}
            nativeButton={false}
            variant="ghost"
            size="icon"
            aria-label="Earlier period"
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-28 text-center text-sm font-medium tabular-nums">
            {shortDate(days[0])} – {shortDate(end)}
          </span>
          {atPresent ? (
            <Button variant="ghost" size="icon" aria-label="Later period" disabled>
              <ChevronRight />
            </Button>
          ) : (
            <Button
              render={<Link href={href(range, nextEnd, today)} />}
              nativeButton={false}
              variant="ghost"
              size="icon"
              aria-label="Later period"
            >
              <ChevronRight />
            </Button>
          )}
        </div>
      </div>

      {summary.loggedDays === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nothing logged in this period</CardTitle>
            <CardDescription>
              Log some meals and your averages, targets and streaks will show up here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Logged {summary.loggedDays} of {summary.totalDays} days. Averages only count days you logged.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Average calories"
              value={`${Math.round(summary.avgCalories)} kcal`}
              hint={`Goal ${Math.round(goals.calories)} kcal`}
            />
            <StatCard
              label="Days on target"
              value={`${summary.daysOnTarget} of ${summary.loggedDays}`}
              hint="Within 10% of your goal"
            />
            <StatCard
              label="Current streak"
              value={plural(streaks.current, "day")}
              hint={atPresent ? "Days in a row you logged" : `Ending ${shortDate(end)}`}
            />
            <StatCard label="Longest streak" value={plural(streaks.longest, "day")} hint="In the past year" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Calories per day</CardTitle>
              <CardDescription>
                Green bars are within 10% of your goal; yellow are outside it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CaloriesChart series={series} goal={goals.calories} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Macros vs goals</CardTitle>
              <CardDescription>Your average per logged day, in grams.</CardDescription>
            </CardHeader>
            <CardContent>
              <MacrosChart
                averages={{ carbsG: summary.avgCarbsG, proteinG: summary.avgProteinG, fatG: summary.avgFatG }}
                goals={goals}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
