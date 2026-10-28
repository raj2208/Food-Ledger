"use client";

import { Search } from "lucide-react";
import { useState, useTransition, type KeyboardEvent } from "react";
import { lookupBarcode } from "@/app/actions";
import { FieldErrorMessage, FormInput } from "@/components/action-form";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { normalizeBarcode, type ProductPrefill } from "@/lib/openfoodfacts";

type Status = { tone: "info" | "error"; text: string };

// The barcode box on the add food form, with a Look up button. A successful lookup hands the
// product to `onFill`; the form shows it and nothing is saved until you press Save.
export function BarcodeLookupField({
  id,
  onFill,
}: {
  id: string;
  onFill: (prefill: ProductPrefill, missing: string[]) => void;
}) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [pending, startTransition] = useTransition();

  function lookUp() {
    const code = normalizeBarcode(value);
    if (!code.ok) {
      setStatus({ tone: "error", text: code.error });
      return;
    }
    setStatus(null);
    startTransition(async () => {
      let result;
      try {
        result = await lookupBarcode(code.barcode);
      } catch {
        setStatus({ tone: "error", text: "Something went wrong. Please try again." });
        return;
      }
      if (!result.ok) {
        setStatus({ tone: "error", text: result.error });
        return;
      }
      setValue(code.barcode);
      if (result.source === "saved") {
        setStatus({ tone: "info", text: `You already saved this as “${result.food.name}”.` });
        return;
      }
      onFill(result.prefill, result.missing);
      const gaps = [
        result.missing.includes("calories") ? "calories" : null,
        result.missing.includes("macros") ? "protein, carbs or fat" : null,
      ].filter(Boolean);
      setStatus({
        tone: "info",
        text:
          `Filled in from Open Food Facts for ${result.prefill.servingLabel}. Check the values before saving.` +
          (gaps.length > 0 ? ` No ${gaps.join(" or ")} data was listed, so fill that in by hand.` : ""),
      });
    });
  }

  // Enter looks the barcode up instead of submitting the whole form.
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (!pending) lookUp();
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>Barcode (optional)</FieldLabel>
      <div className="flex gap-2">
        <FormInput
          id={id}
          name="barcode"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 3017620422003"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <Button type="button" variant="outline" onClick={lookUp} disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : <Search data-icon="inline-start" />}
          {pending ? "Looking up…" : "Look up"}
        </Button>
      </div>
      <FieldErrorMessage id={id} name="barcode" />
      {status?.tone === "error" ? (
        <FieldError role="alert">{status.text}</FieldError>
      ) : status ? (
        <FieldDescription role="status">{status.text}</FieldDescription>
      ) : null}
      <FieldDescription>
        Look-ups use{" "}
        <a
          href="https://world.openfoodfacts.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          Open Food Facts
        </a>{" "}
        data, shared under the ODbL licence. Anyone can edit it, so check the values.
      </FieldDescription>
    </Field>
  );
}
