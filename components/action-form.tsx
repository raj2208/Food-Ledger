"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  Fragment,
  useContext,
  useState,
  useTransition,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
} from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { fail, type ActionResult } from "@/lib/action-result";

type FormAction = (formData: FormData) => Promise<ActionResult>;

type FormState = { fieldErrors: Record<string, string>; pending: boolean };
const FormStateContext = createContext<FormState>({ fieldErrors: {}, pending: false });
export const useFormState = () => useContext(FormStateContext);

type Props = {
  action: FormAction;
  successMessage?: string; // toast title when the action does not supply its own message
  redirectTo?: string; // go here after a successful save
  resetOnSuccess?: boolean; // clear the fields after a successful save (e.g. "add" forms)
  errorsAs?: "inline" | "toast"; // toast: for tiny forms with no fields to put an error next to
  onSuccess?: () => void;
  className?: string;
  children: ReactNode;
};

// A form that shows a toast on success and puts each error next to its field.
// It submits manually (instead of using <form action>) because React would otherwise clear
// every field after the action finishes, wiping what the user typed when there is an error.
export function ActionForm({
  action,
  successMessage = "Saved",
  redirectTo,
  resetOnSuccess,
  errorsAs = "inline",
  onSuccess,
  className,
  children,
}: Props) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [resetCount, setResetCount] = useState(0);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      let next: ActionResult;
      try {
        next = await action(formData);
      } catch {
        next = fail("Something went wrong. Please try again.");
      }
      setResult(next);
      if (!next.ok) {
        if (errorsAs === "toast") toast.add({ title: next.error, type: "error", timeout: 5000 });
        return;
      }
      toast.add({ title: next.message ?? successMessage, type: "success", timeout: 3500 });
      if (resetOnSuccess) setResetCount((c) => c + 1); // remount the fields so they start empty
      onSuccess?.();
      if (redirectTo) router.push(redirectTo);
    });
  }

  const failed = result && !result.ok ? result : null;

  return (
    <FormStateContext.Provider value={{ fieldErrors: failed?.fieldErrors ?? {}, pending }}>
      <form onSubmit={onSubmit} className={className}>
        {failed && errorsAs === "inline" ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{failed.error}</AlertDescription>
          </Alert>
        ) : null}
        <Fragment key={resetCount}>{children}</Fragment>
      </form>
    </FormStateContext.Provider>
  );
}

// An Input that marks itself invalid when the last result had an error for its name.
export function FormInput({ name, id, ...props }: ComponentProps<typeof Input> & { name: string; id: string }) {
  const { fieldErrors } = useFormState();
  const error = fieldErrors[name];
  return (
    <Input
      id={id}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
  );
}

// The message for one field, shown only when there is one. `id` must match the input's id.
export function FieldErrorMessage({ name, id }: { name: string; id: string }) {
  const { fieldErrors } = useFormState();
  const error = fieldErrors[name];
  return error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null;
}

// Submit button that disables itself and shows a spinner while the action runs.
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  ...props
}: ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormState();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (
        <>
          <Spinner data-icon="inline-start" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
