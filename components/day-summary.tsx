import { KcalGauge } from "@/components/kcal-gauge";
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
            <div key={m.label} className="rounded-2xl bg-white/30 p-3 text-center dark:bg-black/20">
              <div className="text-sm font-medium">{m.label}</div>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60 dark:bg-white/20"
                role="progressbar"
                aria-label={m.label}
                aria-valuemin={0}
                aria-valuemax={Math.round(m.goal)}
                aria-valuenow={Math.round(Math.min(m.eaten, m.goal))}
              >
                <div className="h-full rounded-full bg-current" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 text-xs tabular-nums">
                {Math.round(m.eaten)}/{Math.round(m.goal)} g
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
