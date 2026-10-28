"use client";

import { Fragment, useState } from "react";
import { createFood } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/action-form";
import { BarcodeLookupField } from "@/components/barcode-lookup-field";
import { FoodFields, type FoodDefaults } from "@/components/food-fields";

// The add food form. A barcode lookup fills the fields below it; you check and save.
export function AddFoodForm() {
  const [prefill, setPrefill] = useState<FoodDefaults | undefined>();
  const [fillCount, setFillCount] = useState(0);

  return (
    <ActionForm
      action={createFood}
      successMessage="Food saved"
      resetOnSuccess
      onSuccess={() => setPrefill(undefined)}
      className="flex flex-col gap-4"
    >
      <BarcodeLookupField
        id="add-barcode"
        onFill={(p) => {
          setPrefill({
            name: p.name,
            kind: "packaged",
            servingLabel: p.servingLabel,
            calories: p.calories ?? undefined,
            proteinG: p.proteinG,
            carbsG: p.carbsG,
            fatG: p.fatG,
          });
          setFillCount((c) => c + 1); // remount the fields so they pick up the new defaults
        }}
      />
      <Fragment key={fillCount}>
        <FoodFields idPrefix="add" food={prefill} hideBarcode />
      </Fragment>
      <div>
        <SubmitButton>Save food</SubmitButton>
      </div>
    </ActionForm>
  );
}
