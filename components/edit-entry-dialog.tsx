"use client";

import { PencilIcon } from "lucide-react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAX_SERVINGS, MEALS, type MealType } from "@/lib/meals";

type Props = {
  entryId: number;
  foodName: string;
  servingLabel: string;
  quantity: number;
  meal: MealType | null; // null = logged before meals existed: the user must pick one
  action: (formData: FormData) => Promise<void>;
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
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
          className="flex flex-col gap-4"
        >
          <Field>
            <FieldLabel htmlFor={id("quantity")}>Servings</FieldLabel>
            <Input
              id={id("quantity")}
              name="quantity"
              type="number"
              min="0.01"
              max={MAX_SERVINGS}
              step="any"
              required
              defaultValue={quantity}
            />
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
          </Field>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
