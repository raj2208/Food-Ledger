"use client";

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { isOnTarget, type GoalValues, type SeriesDay } from "@/lib/insights";

function fullLabel(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// 7 days: "Mon"; 30 days: the day of the month, which stays readable when crowded.
function tickLabel(day: string, count: number): string {
  if (count <= 7) return fullLabel(day).split(",")[0];
  return String(Number(day.slice(8)));
}

// Round y-axis ticks (e.g. 0, 500, 1000, ...) that reach a little above `highest`, using the
// smallest "nice" step that keeps the axis to about six ticks.
function niceAxis(highest: number): { top: number; ticks: number[] } {
  const steps = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  const padded = Math.max(highest, 1) * 1.05;
  const step = steps.find((st) => Math.ceil(padded / st) <= 6) ?? 10000;
  const top = Math.ceil(padded / step) * step;
  return { top, ticks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
}

const caloriesConfig = {
  onTarget: { label: "Within 10% of goal", color: "var(--chart-1)" },
  offTarget: { label: "Outside 10% of goal", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function CaloriesChart({ series, goal }: { series: SeriesDay[]; goal: number }) {
  const data = series.map((d) => ({
    day: d.day,
    tick: tickLabel(d.day, series.length),
    calories: Math.round(d.calories),
    logged: d.logged,
    onTarget: d.logged && isOnTarget(d.calories, goal),
  }));

  const { top, ticks } = niceAxis(Math.max(goal, ...data.map((d) => d.calories)));

  return (
    <>
      <ChartContainer
        config={caloriesConfig}
        className="aspect-auto h-56 w-full"
        role="img"
        aria-label={`Bar chart of calories per day against your goal of ${Math.round(goal)} kcal`}
      >
        <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="tick" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={8} />
          <YAxis width={40} tickLine={false} axisLine={false} domain={[0, top]} ticks={ticks} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideIndicator
                labelFormatter={(_, payload) => fullLabel(payload?.[0]?.payload?.day ?? "")}
                formatter={(value, _name, item) => (
                  <span className="tabular-nums">
                    {item.payload.logged ? `${Number(value).toLocaleString("en-US")} kcal` : "Nothing logged"}
                  </span>
                )}
              />
            }
          />
          <ReferenceLine y={goal} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
          <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.day} fill={d.onTarget ? "var(--color-onTarget)" : "var(--color-offTarget)"} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span aria-hidden="true" className="inline-block w-6 border-t-2 border-dashed border-muted-foreground" />
        Goal {Math.round(goal).toLocaleString("en-US")} kcal
      </div>
      <table className="sr-only">
        <caption>Calories per day. Goal {Math.round(goal)} kcal.</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Calories</th>
            <th>Within 10% of goal</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>{d.day}</td>
              <td>{d.logged ? d.calories : "not logged"}</td>
              <td>{d.logged ? (d.onTarget ? "yes" : "no") : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const macroConfig = {
  average: { label: "Your average", color: "var(--chart-1)" },
  goal: { label: "Goal", color: "var(--chart-3)" },
} satisfies ChartConfig;

type MacroAverages = { carbsG: number; proteinG: number; fatG: number };

export function MacrosChart({ averages, goals }: { averages: MacroAverages; goals: GoalValues }) {
  const data = [
    { macro: "Carbs", average: Math.round(averages.carbsG), goal: Math.round(goals.carbsG) },
    { macro: "Protein", average: Math.round(averages.proteinG), goal: Math.round(goals.proteinG) },
    { macro: "Fat", average: Math.round(averages.fatG), goal: Math.round(goals.fatG) },
  ];

  const macroAxis = niceAxis(Math.max(...data.flatMap((d) => [d.average, d.goal])));

  return (
    <>
      <ChartContainer
        config={macroConfig}
        className="aspect-auto h-56 w-full"
        role="img"
        aria-label="Bar chart comparing your average carbs, protein and fat with your goals, in grams"
      >
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="macro" tickLine={false} axisLine={false} />
          <YAxis width={40} tickLine={false} axisLine={false} domain={[0, macroAxis.top]} ticks={macroAxis.ticks} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="average" fill="var(--color-average)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="goal" fill="var(--color-goal)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>Average grams per logged day compared with your goals.</caption>
        <thead>
          <tr>
            <th>Nutrient</th>
            <th>Average (g)</th>
            <th>Goal (g)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.macro}>
              <td>{d.macro}</td>
              <td>{d.average}</td>
              <td>{d.goal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
