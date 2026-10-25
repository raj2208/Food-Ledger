"use client";

import { CalendarDays, NotebookText, Apple, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Log", icon: NotebookText },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/foods", label: "Foods", icon: Apple },
  { href: "/goals", label: "Goals", icon: Target },
];

// Fixed bottom tab bar, like most mobile apps. The current page is highlighted.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgba(0,0,0,0.08)]"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-4 px-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs",
                  active ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                    active && "bg-secondary",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
