"use client";

import { useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";

// Next keeps pages you have visited alive (hidden) so their UI state survives navigation.
// For a form prefilled from the database that means re-opening it can show old text, because
// the preserved input keeps its old value even though its default changed.
// Keying on bfcacheId remounts the form on every fresh open (a link click), so it always
// shows current data and "Cancel" really discards a half-typed draft. Browser back/forward
// still restores the draft.
export function FreshOnOpen({ children }: { children: ReactNode }) {
  const { bfcacheId } = useRouter();
  return <Fragment key={bfcacheId}>{children}</Fragment>;
}
