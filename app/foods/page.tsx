import { ChevronDown } from "lucide-react";
import { Suspense } from "react";
import { createFood, deleteFood, updateFood } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { DeleteFoodButton } from "@/components/delete-food-button";
import { FoodFields } from "@/components/food-fields";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { listFoods } from "@/lib/foods";

export const metadata = { title: "Foods · Food Ledger" };

export default function FoodsPage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add a food</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={createFood} successMessage="Food saved" resetOnSuccess className="flex flex-col gap-4">
              <FoodFields idPrefix="add" />
              <div>
                <SubmitButton>Save food</SubmitButton>
              </div>
            </ActionForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your foods</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-16 w-full" />}>
              <FoodList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

async function FoodList() {
  const foods = await listFoods();
  if (foods.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nothing saved yet. Add your first food above.</p>
    );
  }
  return (
    <ItemGroup className="gap-0">
      {foods.map((f, i) => (
        <div key={f.id}>
          {i > 0 ? <ItemSeparator className="my-0" /> : null}
          <Collapsible>
            <CollapsibleTrigger className="group/trigger flex w-full items-center justify-between gap-4 rounded-md py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-medium">{f.name}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {f.servingLabel}
                  <Badge variant="secondary">{f.kind === "packaged" ? "Packaged" : "Non-packaged"}</Badge>
                </span>
              </span>
              <span className="flex items-center gap-2 text-sm tabular-nums">
                {Math.round(f.calories)} kcal
                <ChevronDown
                  className="size-4 text-muted-foreground transition-transform group-data-[panel-open]/trigger:rotate-180"
                  aria-hidden="true"
                />
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-4 pb-3">
                {f.notes ? <p className="text-xs italic text-muted-foreground">{f.notes}</p> : null}
                <ActionForm action={updateFood.bind(null, f.id)} className="flex flex-col gap-4">
                  <FoodFields food={f} idPrefix={`edit-${f.id}`} />
                  <p className="text-xs text-muted-foreground">
                    Changes apply to future logs only. Past entries keep the values they were logged with.
                  </p>
                  <div className="flex gap-2">
                    <SubmitButton>Update</SubmitButton>
                    <DeleteFoodButton id={f.id} name={f.name} action={deleteFood} />
                  </div>
                </ActionForm>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}
    </ItemGroup>
  );
}
