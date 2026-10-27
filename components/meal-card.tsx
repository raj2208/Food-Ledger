import { Coffee, Cookie, Minus, Plus, Salad, Soup, Utensils } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { deleteEntry, updateEntry } from "@/app/actions";
import { EditEntryDialog } from "@/components/edit-entry-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { totalsFor, type LogEntry, type MealType } from "@/lib/log";
import { cn } from "@/lib/utils";

const ICONS = { breakfast: Coffee, lunch: Salad, dinner: Soup, snack: Cookie } as const;

type Props = {
  meal: MealType | null; // null = entries logged before meals existed
  title: string;
  recommended?: [number, number];
  entries: LogEntry[];
  isOpen?: boolean;
  // Where tapping the header goes: opens the card, or closes it if it is already open.
  // Omit for cards that cannot be opened (Unassigned).
  toggleHref?: string;
  children?: ReactNode; // shown only while the card is open (the add-food controls)
};

export function MealCard({ meal, title, recommended, entries, isOpen = false, toggleHref, children }: Props) {
  const Icon = meal ? ICONS[meal] : Utensils;
  const kcal = Math.round(totalsFor(entries).calories);

  const header = (
    <>
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
      {kcal > 0 ? <span className="text-sm tabular-nums text-muted-foreground">{kcal} kcal</span> : null}
      {toggleHref ? (
        <span
          aria-hidden="true"
          className={cn(
            buttonVariants({ variant: isOpen ? "default" : "secondary", size: "icon-lg" }),
            "rounded-full",
          )}
        >
          {isOpen ? <Minus /> : <Plus />}
        </span>
      ) : null}
    </>
  );

  return (
    <Card className={cn(isOpen && "ring-2 ring-primary/40")}>
      <CardContent className="flex flex-col gap-3">
        {toggleHref ? (
          <Link
            href={toggleHref}
            scroll={false}
            aria-expanded={isOpen}
            className="-m-1 flex items-center gap-3 rounded-xl p-1 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {header}
          </Link>
        ) : (
          <div className="flex items-center gap-3">{header}</div>
        )}

        {entries.length > 0 ? (
          <>
            <Separator />
            <ItemGroup className="gap-0">
              {entries.map((e, i) => (
                <div key={e.id}>
                  {i > 0 ? <ItemSeparator className="my-0" /> : null}
                  <Item size="sm" className="px-0">
                    <ItemContent>
                      <ItemTitle>{e.foodName}</ItemTitle>
                      <ItemDescription>
                        {e.quantity} × {e.servingLabel}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <span className="text-sm tabular-nums">{Math.round(e.calories * e.quantity)} kcal</span>
                      <EditEntryDialog
                        entryId={e.id}
                        foodName={e.foodName}
                        servingLabel={e.servingLabel}
                        quantity={e.quantity}
                        meal={e.meal}
                        action={updateEntry.bind(null, e.id)}
                      />
                      <form action={deleteEntry.bind(null, e.id)}>
                        <Button type="submit" variant="outline" size="sm">
                          Remove
                        </Button>
                      </form>
                    </ItemActions>
                  </Item>
                </div>
              ))}
            </ItemGroup>
          </>
        ) : null}

        {isOpen && children ? (
          <>
            <Separator />
            <div>{children}</div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
