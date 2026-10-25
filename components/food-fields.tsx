import type { Food } from "@/lib/foods";

const input =
  "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";
const label = "flex flex-col gap-1 text-xs font-medium text-zinc-500";

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
          defaultValue={food?.serving_label}
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
          defaultValue={food?.protein_g}
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
          defaultValue={food?.carbs_g}
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
          defaultValue={food?.fat_g}
          className={input}
        />
      </label>
      <label className={`${label} col-span-2`}>
        Barcode (optional)
        <input name="barcode" defaultValue={food?.barcode ?? ""} className={input} />
      </label>
    </div>
  );
}

export const buttonClass =
  "rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";
export const ghostButtonClass =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900";
export const inputClass = input;
