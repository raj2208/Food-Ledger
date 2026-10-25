import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Round icon buttons in the nav: translucent so they sit nicely on the gradient band.
export const navIconButton = cn(
  buttonVariants({ variant: "outline", size: "icon" }),
  "relative rounded-full border-transparent bg-white/30 hover:bg-white/50 dark:bg-black/20 dark:hover:bg-black/30",
);
