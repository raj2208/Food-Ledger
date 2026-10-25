"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { plainIconButton } from "@/components/nav-styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// One tap flips light <-> dark. Until the first tap the app follows the OS setting.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle light or dark theme"
      className={cn(plainIconButton)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Icons swap via the `dark` class, so there is no hydration mismatch. */}
      <span className="relative size-7">
        <Sun className="size-7 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute inset-0 size-7 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </span>
    </Button>
  );
}
