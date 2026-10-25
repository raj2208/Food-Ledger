import { KcalGauge } from "@/components/kcal-gauge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Goals } from "@/lib/goals";
import type { DayTotals } from "@/lib/log";

function Stat({ label, value, align }: { label: string; value: number; align: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div className="text-sm">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

// Lives inside the page's gradient band (see PageShell), so it draws no background of its own.
export function DaySummary({ totals, goals }: { totals: DayTotals; goals: Goals }) {
  const macros = [
    { label: "Carbs", eaten: totals.carbsG, goal: goals.carbsG },
    { label: "Protein", eaten: totals.proteinG, goal: goals.proteinG },
    { label: "Fat", eaten: totals.fatG, goal: goals.fatG },
  ];

  return (
    <div>
      <h1 className="mb-4 text-center text-sm font-medium">Log it once. Track it forever.</h1>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <Stat label="Eaten" value={Math.round(totals.calories)} align="left" />
        <div className="w-44 sm:w-56">
          <KcalGauge eaten={totals.calories} goal={goals.calories} />
        </div>
        <Stat label="Goal" value={Math.round(goals.calories)} align="right" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {macros.map((m) => {
          const pct = m.goal > 0 ? Math.min(100, (m.eaten / m.goal) * 100) : 0;
          return (
            <Card
              key={m.label}
              size="sm"
              className="gap-2 bg-white/30 text-center text-current shadow-none ring-0 dark:bg-black/20"
            >
              <div className="px-3 text-sm font-medium">{m.label}</div>
              <div className="px-3">
                <Progress
                  value={pct}
                  aria-label={m.label}
                  className="[&_[data-slot=progress-indicator]]:bg-current [&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-white/60 dark:[&_[data-slot=progress-track]]:bg-white/20"
                />
              </div>
              <div className="px-3 text-xs tabular-nums">
                {Math.round(m.eaten)}/{Math.round(m.goal)} g
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
