"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useRef,
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
import type { ActionResult } from "@/lib/action-result";

type FormAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

type FormState = { fieldErrors: Record<string, string>; pending: boolean };
const FormStateContext = createContext<FormState>({ fieldErrors: {}, pending: false });
export const useFormState = () => useContext(FormStateContext);

type Props = {
  action: FormAction;
  successMessage?: string; // toast title when the action does not supply its own message
  redirectTo?: string; // go here after a successful save
  resetOnSuccess?: boolean; // clear the fields after a successful save (e.g. "add" forms)
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
  onSuccess,
  className,
  children,
}: Props) {
  const [state, run, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const handled = useRef<ActionResult | null>(null);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  useEffect(() => {
    if (!state || handled.current === state) return; // react to each result once
    handled.current = state;
    if (!state.ok) return;
    toast.add({ title: state.message ?? successMessage, type: "success", timeout: 3500 });
    if (resetOnSuccess) formRef.current?.reset();
    onSuccessRef.current?.();
    if (redirectTo) router.push(redirectTo);
  }, [state, successMessage, resetOnSuccess, redirectTo, router]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => run(formData));
  }

  const failed = state && !state.ok ? state : null;

  return (
    <FormStateContext.Provider value={{ fieldErrors: failed?.fieldErrors ?? {}, pending }}>
      <form ref={formRef} onSubmit={onSubmit} className={className}>
        {failed ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{failed.error}</AlertDescription>
          </Alert>
        ) : null}
        {children}
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
