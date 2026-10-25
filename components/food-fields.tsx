import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Food } from "@/lib/foods";

const KINDS = [
  { value: "homemade", label: "Non-packaged" },
  { value: "packaged", label: "Packaged" },
];

// idPrefix keeps the field ids unique when several food forms share one page.
export function FoodFields({ food, idPrefix }: { food?: Food; idPrefix: string }) {
  const id = (field: string) => `${idPrefix}-${field}`;

  const numbers = [
    { name: "calories", label: "Calories (kcal)", value: food?.calories, required: true },
    { name: "protein_g", label: "Protein (g)", value: food?.proteinG },
    { name: "carbs_g", label: "Carbs (g)", value: food?.carbsG },
    { name: "fat_g", label: "Fat (g)", value: food?.fatG },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Field className="col-span-2">
        <FieldLabel htmlFor={id("name")}>Name</FieldLabel>
        <Input id={id("name")} name="name" required defaultValue={food?.name} />
      </Field>

      <Field>
        <FieldLabel htmlFor={id("kind")}>Type</FieldLabel>
        <Select name="kind" items={KINDS} defaultValue={food?.kind ?? "homemade"}>
          <SelectTrigger id={id("kind")} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KINDS.map((k) => (
              <SelectItem key={k.value} value={k.value}>
                {k.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor={id("serving")}>Serving</FieldLabel>
        <Input
          id={id("serving")}
          name="serving_label"
          placeholder="1 bowl"
          defaultValue={food?.servingLabel}
        />
      </Field>

      {numbers.map((n) => (
        <Field key={n.name}>
          <FieldLabel htmlFor={id(n.name)}>{n.label}</FieldLabel>
          <Input
            id={id(n.name)}
            name={n.name}
            type="number"
            min="0"
            step="any"
            required={n.required}
            defaultValue={n.value}
          />
        </Field>
      ))}

      <Field className="col-span-2">
        <FieldLabel htmlFor={id("barcode")}>Barcode (optional)</FieldLabel>
        <Input id={id("barcode")} name="barcode" defaultValue={food?.barcode ?? ""} />
      </Field>

      <Field className="col-span-2 sm:col-span-4">
        <FieldLabel htmlFor={id("notes")}>Notes (optional)</FieldLabel>
        <Input
          id={id("notes")}
          name="notes"
          placeholder="e.g. less oil, from the corner shop"
          defaultValue={food?.notes ?? ""}
        />
      </Field>
    </div>
  );
}
