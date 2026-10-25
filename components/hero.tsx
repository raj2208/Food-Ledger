import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="rounded-xl border bg-secondary px-6 py-10 text-center sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Log it once. Track it forever.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        Save your everyday meals with their calories, then add them to any day in one tap.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
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
