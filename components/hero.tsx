import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="rounded-3xl border bg-secondary px-6 py-6 text-center sm:py-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Log it once. Track it forever.
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
        Save your everyday meals with their calories, then add them to any day in one tap.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link href="#log-food" className={buttonVariants({ size: "lg" })}>
          Log a meal
        </Link>
        <Link href="/foods" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Add a food
        </Link>
      </div>
    </section>
  );
}
