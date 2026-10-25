"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { navIconButton } from "@/components/nav-styles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Hamburger menu shown below the `sm` breakpoint, where the inline links no longer fit.
export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Open menu" className={cn(navIconButton, "sm:hidden")}>
        <Menu className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {links.map((l) => (
          <DropdownMenuItem key={l.href} render={<Link href={l.href} />} className="py-2">
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
