import { Coffee, Plus, Salad, Soup, Utensils } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { deleteEntry } from "@/app/actions";
import { ghostButtonClass } from "@/components/food-fields";
import { totalsFor, type LogEntry, type MealType } from "@/lib/log";
import { cn } from "@/lib/utils";

const ICONS = { breakfast: Coffee, lunch: Salad, dinner: Soup } as const;

type Props = {
  meal: MealType | null; // null = entries logged before meals existed
  title: string;
  recommended?: [number, number];
  entries: LogEntry[];
  isOpen?: boolean;
  addHref?: string;
  children?: ReactNode; // shown only while the card is open (the add-food controls)
};

export function MealCard({ meal, title, recommended, entries, isOpen = false, addHref, children }: Props) {
  const Icon = meal ? ICONS[meal] : Utensils;
  const kcal = Math.round(totalsFor(entries).calories);

  return (
    <section
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-sm",
        isOpen && "ring-2 ring-primary/40",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{title}</h3>
          {recommended ? (
            <p className="text-xs text-muted-foreground">
              Recommended: {recommended[0]} — {recommended[1]} kcal
            </p>
          ) : null}
        </div>
        {kcal > 0 ? (
          <span className="text-sm tabular-nums text-muted-foreground">{kcal} kcal</span>
        ) : null}
        {addHref ? (
          <Link
            href={addHref}
            aria-label={`Add food to ${title}`}
            aria-current={isOpen ? "true" : undefined}
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              isOpen
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            <Plus className="size-5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {entries.length > 0 ? (
        <ul className="mt-3 flex flex-col divide-y divide-border border-t">
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
      ) : null}

      {isOpen && children ? <div className="mt-4 border-t pt-4">{children}</div> : null}
    </section>
  );
}
