import { Suspense } from "react";
import { saveGoals } from "@/app/actions";
import { ActionForm, FieldErrorMessage, FormInput, SubmitButton } from "@/components/action-form";
import { FreshOnOpen } from "@/components/fresh-on-open";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { getGoals } from "@/lib/goals";

export const metadata = { title: "Goals · Food Ledger" };

export default function GoalsPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader>
          <CardTitle>Daily goals</CardTitle>
          <CardDescription>
            These drive the &ldquo;kcal left&rdquo; gauge, the macro bars, and the recommended range on each meal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-24 w-full" />}>
            <GoalsForm />
          </Suspense>
        </CardContent>
      </Card>
    </PageShell>
  );
}

async function GoalsForm() {
  const goals = await getGoals();
  const fields = [
    { name: "calories", label: "Calories (kcal)", value: goals.calories, min: "1" },
    { name: "carbs_g", label: "Carbs (g)", value: goals.carbsG, min: "0" },
    { name: "protein_g", label: "Protein (g)", value: goals.proteinG, min: "0" },
    { name: "fat_g", label: "Fat (g)", value: goals.fatG, min: "0" },
  ];
  return (
    <FreshOnOpen>
      <ActionForm action={saveGoals} successMessage="Goals saved" redirectTo="/" className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {fields.map((f) => (
            <Field key={f.name}>
              <FieldLabel htmlFor={`goal-${f.name}`}>{f.label}</FieldLabel>
              <FormInput
                id={`goal-${f.name}`}
                name={f.name}
                type="number"
                min={f.min}
                step="any"
                required
                defaultValue={f.value}
              />
              <FieldErrorMessage id={`goal-${f.name}`} name={f.name} />
            </Field>
          ))}
        </div>
        <div>
          <SubmitButton>Save goals</SubmitButton>
        </div>
      </ActionForm>
    </FreshOnOpen>
  );
}
