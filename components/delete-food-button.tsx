"use client";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import type { ActionResult } from "@/lib/action-result";

type Props = {
  id: number;
  name: string;
  action: (id: number, name: string) => Promise<ActionResult>;
};

// Deleting a food asks first, because it cannot be undone.
export function DeleteFoodButton({ id, name, action }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      try {
        const result = await action(id, name);
        if (result.ok) toast.add({ title: result.message ?? "Deleted", type: "success", timeout: 3500 });
        else toast.add({ title: result.error, type: "error" });
      } catch {
        toast.add({ title: "Something went wrong. Please try again.", type: "error" });
      }
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button type="button" variant="destructive" />}>Delete</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Entries you already logged keep their values. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={confirm}>
            {pending ? (
              <>
                <Spinner data-icon="inline-start" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
