"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { navIcon } from "@/components/nav-styles";

// One tap flips light <-> dark. Until the first tap the app follows the OS setting.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle light or dark theme"
      className={navIcon}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Icons swap via the `dark` class, so there is no hydration mismatch. */}
      <span className="relative size-7">
        <Sun className="size-7 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute inset-0 size-7 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </span>
    </button>
  );
}
