import { FieldErrorMessage, FormInput } from "@/components/action-form";
import { Field, FieldLabel } from "@/components/ui/field";
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

// Meant to sit inside an <ActionForm>, which supplies the per-field error messages.
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
        <FormInput id={id("name")} name="name" required defaultValue={food?.name} />
        <FieldErrorMessage id={id("name")} name="name" />
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
        <FieldErrorMessage id={id("kind")} name="kind" />
      </Field>

      <Field>
        <FieldLabel htmlFor={id("serving")}>Serving</FieldLabel>
        <FormInput
          id={id("serving")}
          name="serving_label"
          placeholder="1 bowl"
          defaultValue={food?.servingLabel}
        />
        <FieldErrorMessage id={id("serving")} name="serving_label" />
      </Field>

      {numbers.map((n) => (
        <Field key={n.name}>
          <FieldLabel htmlFor={id(n.name)}>{n.label}</FieldLabel>
          <FormInput
            id={id(n.name)}
            name={n.name}
            type="number"
            min="0"
            step="any"
            required={n.required}
            defaultValue={n.value}
          />
          <FieldErrorMessage id={id(n.name)} name={n.name} />
        </Field>
      ))}

      <Field className="col-span-2">
        <FieldLabel htmlFor={id("barcode")}>Barcode (optional)</FieldLabel>
        <FormInput id={id("barcode")} name="barcode" defaultValue={food?.barcode ?? ""} />
        <FieldErrorMessage id={id("barcode")} name="barcode" />
      </Field>

      <Field className="col-span-2 sm:col-span-4">
        <FieldLabel htmlFor={id("notes")}>Notes (optional)</FieldLabel>
        <FormInput
          id={id("notes")}
          name="notes"
          placeholder="e.g. less oil, from the corner shop"
          defaultValue={food?.notes ?? ""}
        />
        <FieldErrorMessage id={id("notes")} name="notes" />
      </Field>
    </div>
  );
}
