import { CircleUser } from "lucide-react";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { navIconButton } from "@/components/nav-styles";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/", label: "Log" },
  { href: "/calendar", label: "Calendar" },
  { href: "/foods", label: "Foods" },
  { href: "/goals", label: "Goals" },
];

export function SiteNav() {
  return (
    <nav aria-label="Main" className="flex items-center justify-between gap-3 py-4">
      <Link href="/" className="text-lg font-semibold">
        Food Ledger
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Inline links from `sm` up; below that they collapse into the hamburger. */}
        <div className="hidden items-center gap-4 text-sm font-medium sm:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:underline">
              {l.label}
            </Link>
          ))}
        </div>
        <ThemeToggle />
        <Link href="/profile" aria-label="Profile" className={navIconButton}>
          <CircleUser className="size-4" aria-hidden="true" />
        </Link>
        <MobileNav links={LINKS} />
      </div>
    </nav>
  );
}
