"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { ActionResult, RemoveResult } from "@/lib/action-result";
import type { RestorableEntry } from "@/lib/meals";

type Props = {
  id: number;
  foodName: string;
  remove: (id: number) => Promise<RemoveResult>;
  restore: (entry: RestorableEntry) => Promise<ActionResult>;
};

const GENERIC = "Something went wrong. Please try again.";

// Removes an entry, then offers "Undo" in a toast. Undo sends the full copy of the entry back,
// so it returns exactly as it was. The toast outlives this button (the entry vanishes from the
// page), which is fine: it only needs the two actions, not this component.
export function RemoveEntryButton({ id, foodName, remove, restore }: Props) {
  const [pending, startTransition] = useTransition();

  async function undo(entry: RestorableEntry) {
    try {
      const result = await restore(entry);
      if (result.ok) toast.add({ title: result.message ?? "Restored", type: "success", timeout: 3500 });
      else toast.add({ title: result.error, type: "error", timeout: 6000 });
    } catch {
      toast.add({ title: GENERIC, type: "error", timeout: 6000 });
    }
  }

  function onRemove() {
    startTransition(async () => {
      let result: RemoveResult;
      try {
        result = await remove(id);
      } catch {
        toast.add({ title: GENERIC, type: "error", timeout: 6000 });
        return;
      }
      if (!result.ok) {
        toast.add({ title: result.error, type: "error", timeout: 6000 });
        return;
      }
      const entry = result.entry;
      const toastId = toast.add({
        title: `Removed ${foodName}`,
        timeout: 8000,
        actionProps: {
          children: "Undo",
          onClick: () => {
            toast.close(toastId); // one Undo per removal
            void undo(entry);
          },
        },
      });
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={onRemove}>
      Remove
    </Button>
  );
}
