"use client";

import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { ActionForm, FieldErrorMessage, FormInput, SubmitButton } from "@/components/action-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ActionResult } from "@/lib/action-result";
import { MAX_SERVINGS, MEALS, type MealType } from "@/lib/meals";

type Props = {
  entryId: number;
  foodName: string;
  servingLabel: string;
  quantity: number;
  meal: MealType | null; // null = logged before meals existed: the user must pick one
  action: (formData: FormData) => Promise<ActionResult>;
};

// Change an entry's servings or meal. The dialog content only exists while open, so every
// opening starts from the entry's current values.
export function EditEntryDialog({ entryId, foodName, servingLabel, quantity, meal, action }: Props) {
  const [open, setOpen] = useState(false);
  const id = (field: string) => `entry-${entryId}-${field}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" variant="outline" size="icon-sm" aria-label={`Edit ${foodName}`} />}
      >
        <PencilIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit entry</DialogTitle>
          <DialogDescription>
            {foodName} · {servingLabel}
          </DialogDescription>
        </DialogHeader>
        <ActionForm
          action={action}
          successMessage="Entry updated"
          onSuccess={() => setOpen(false)}
          className="flex flex-col gap-4"
        >
          <Field>
            <FieldLabel htmlFor={id("quantity")}>Servings</FieldLabel>
            <FormInput
              id={id("quantity")}
              name="quantity"
              type="number"
              min="0.01"
              max={MAX_SERVINGS}
              step="any"
              required
              defaultValue={quantity}
            />
            <FieldErrorMessage id={id("quantity")} name="quantity" />
          </Field>
          <Field>
            <FieldLabel htmlFor={id("meal")}>Meal</FieldLabel>
            <Select name="meal" required items={MEALS} defaultValue={meal}>
              <SelectTrigger id={id("meal")} className="w-full">
                <SelectValue placeholder="Pick a meal" />
              </SelectTrigger>
              <SelectContent>
                {MEALS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldErrorMessage id={id("meal")} name="meal" />
          </Field>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <SubmitButton>Save changes</SubmitButton>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
