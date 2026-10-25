import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";

// One continuous gradient band: the nav, plus (on the home page) the day summary.
// The nav is static so it shows instantly while a page's data streams in.
export function PageShell({ hero, children }: { hero?: ReactNode; children: ReactNode }) {
  return (
    <>
      <header className="bg-brand-gradient rounded-b-[2.5rem] shadow-sm">
        <div className="mx-auto w-full max-w-2xl px-4 pb-6">
          <SiteNav />
          {hero}
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
