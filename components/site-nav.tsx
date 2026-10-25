import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

const LINKS = [
  { href: "/", label: "Log" },
  { href: "/calendar", label: "Calendar" },
  { href: "/foods", label: "Foods" },
  { href: "/goals", label: "Goals" },
];

export function SiteNav() {
  return (
    <nav aria-label="Main" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4">
      <Link href="/" className="text-lg font-semibold">
        Food Ledger
      </Link>
      <div className="flex items-center gap-3 text-sm font-medium sm:gap-4">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:underline">
            {l.label}
          </Link>
        ))}
        <ModeToggle />
      </div>
    </nav>
  );
}
