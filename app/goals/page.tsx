import { Suspense } from "react";
import { saveGoals } from "@/app/actions";
import { buttonClass, inputClass } from "@/components/food-fields";
import { PageShell } from "@/components/page-shell";
import { getGoals } from "@/lib/goals";

export const metadata = { title: "Goals · Food Ledger" };

export default function GoalsPage() {
  return (
    <PageShell>
      <section>
        <h2 className="mb-1 text-lg font-semibold">Daily goals</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          These drive the &ldquo;kcal left&rdquo; gauge, the macro bars, and the recommended range on each meal.
        </p>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <GoalsForm />
        </Suspense>
      </section>
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
    <form action={saveGoals} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {fields.map((f) => (
          <label
            key={f.name}
            className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
          >
            {f.label}
            <input
              name={f.name}
              type="number"
              min={f.min}
              step="any"
              required
              defaultValue={f.value}
              className={inputClass}
            />
          </label>
        ))}
      </div>
      <div>
        <button type="submit" className={buttonClass}>
          Save goals
        </button>
      </div>
    </form>
  );
}
