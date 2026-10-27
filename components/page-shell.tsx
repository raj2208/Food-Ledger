import type { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { SiteNav } from "@/components/site-nav";
import { cn } from "@/lib/utils";

// One continuous gradient band: the top bar, plus (on the home page) the day summary.
// The bars are static so they show instantly while a page's data streams in.
export function PageShell({ hero, children }: { hero?: ReactNode; children: ReactNode }) {
  return (
    <>
      <header className="bg-brand-gradient shadow-sm">
        {/* Extra bottom space only when there is a summary under the nav; other pages get just the nav. */}
        <div className={cn("mx-auto w-full max-w-2xl px-4", hero && "pb-6")}>
          <SiteNav />
          {hero}
        </div>
      </header>
      {/* pb-28 keeps the last content clear of the fixed bottom bar. */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-28">{children}</main>
      <BottomNav />
    </>
  );
}
