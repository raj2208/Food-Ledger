import { CircleUser } from "lucide-react";
import Link from "next/link";
import { navIcon } from "@/components/nav-styles";
import { ThemeToggle } from "@/components/theme-toggle";

// Top bar: brand on the left, theme and profile on the right.
// The page links live in the bottom tab bar (see BottomNav).
export function SiteNav() {
  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <Link href="/" className="text-lg font-semibold">
        Food Ledger
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Link href="/profile" aria-label="Profile" className={navIcon}>
          <CircleUser className="size-7" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
