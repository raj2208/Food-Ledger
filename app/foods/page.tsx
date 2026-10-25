import { Suspense } from "react";
import { createFood, deleteFood, updateFood } from "@/app/actions";
import {
  buttonClass,
  FoodFields,
  ghostButtonClass,
} from "@/components/food-fields";
import { listFoods } from "@/lib/foods";

export const metadata = { title: "Foods · Food Ledger" };

export default function FoodsPage() {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Add a food</h2>
        <form action={createFood} className="flex flex-col gap-3">
          <FoodFields />
          <div>
            <button type="submit" className={buttonClass}>
              Save food
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your foods</h2>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <FoodList />
        </Suspense>
      </section>
    </div>
  );
}

async function FoodList() {
  const foods = await listFoods();
  if (foods.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing saved yet. Add your first food above.
      </p>
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-border">
      {foods.map((f) => (
        <li key={f.id} className="py-2">
          <details>
            <summary className="flex cursor-pointer items-baseline justify-between gap-4">
              <span>
                {f.name}{" "}
                <span className="text-xs text-muted-foreground">
                  · {f.servingLabel} · {f.kind === "packaged" ? "packaged" : "non-packaged"}
                </span>
              </span>
              <span className="text-sm tabular-nums">{Math.round(f.calories)} kcal</span>
            </summary>
            {f.notes ? (
              <p className="mt-1 text-xs italic text-muted-foreground">{f.notes}</p>
            ) : null}
            <form
              action={updateFood.bind(null, f.id)}
              className="mt-3 flex flex-col gap-3"
            >
              <FoodFields food={f} />
              <p className="text-xs text-muted-foreground">
                Changes apply to future logs only. Past entries keep the values
                they were logged with.
              </p>
              <div className="flex gap-2">
                <button type="submit" className={buttonClass}>
                  Update
                </button>
                <button
                  type="submit"
                  formAction={deleteFood.bind(null, f.id)}
                  formNoValidate
                  className={ghostButtonClass}
                >
                  Delete
                </button>
              </div>
            </form>
          </details>
        </li>
      ))}
    </ul>
  );
}
