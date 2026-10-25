import type { Food } from "@/lib/foods";

const input =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm";
const label = "flex flex-col gap-1 text-xs font-medium text-muted-foreground";

export function FoodFields({ food }: { food?: Food }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <label className={`${label} col-span-2`}>
        Name
        <input name="name" required defaultValue={food?.name} className={input} />
      </label>
      <label className={label}>
        Type
        <select name="kind" defaultValue={food?.kind ?? "homemade"} className={input}>
          <option value="homemade">Non-packaged</option>
          <option value="packaged">Packaged</option>
        </select>
      </label>
      <label className={label}>
        Serving
        <input
          name="serving_label"
          placeholder="1 bowl"
          defaultValue={food?.servingLabel}
          className={input}
        />
      </label>
      <label className={label}>
        Calories (kcal)
        <input
          name="calories"
          type="number"
          min="0"
          step="any"
          required
          defaultValue={food?.calories}
          className={input}
        />
      </label>
      <label className={label}>
        Protein (g)
        <input
          name="protein_g"
          type="number"
          min="0"
          step="any"
          defaultValue={food?.proteinG}
          className={input}
        />
      </label>
      <label className={label}>
        Carbs (g)
        <input
          name="carbs_g"
          type="number"
          min="0"
          step="any"
          defaultValue={food?.carbsG}
          className={input}
        />
      </label>
      <label className={label}>
        Fat (g)
        <input
          name="fat_g"
          type="number"
          min="0"
          step="any"
          defaultValue={food?.fatG}
          className={input}
        />
      </label>
      <label className={`${label} col-span-2`}>
        Barcode (optional)
        <input name="barcode" defaultValue={food?.barcode ?? ""} className={input} />
      </label>
      <label className={`${label} col-span-2 sm:col-span-4`}>
        Notes (optional)
        <input
          name="notes"
          placeholder="e.g. less oil, from the corner shop"
          defaultValue={food?.notes ?? ""}
          className={input}
        />
      </label>
    </div>
  );
}

export const buttonClass =
  "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90";
export const ghostButtonClass =
  "rounded-md border border-input px-3 py-1.5 text-xs hover:bg-muted";
export const inputClass = input;
