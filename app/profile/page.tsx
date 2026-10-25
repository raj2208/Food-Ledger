import Link from "next/link";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { getGoals } from "@/lib/goals";
import { ageFrom, formatDate, initials } from "@/lib/profile";
import { getCurrentUser } from "@/lib/users";

export const metadata = { title: "Profile · Food Ledger" };

export default function ProfilePage() {
  return (
    <PageShell>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <Profile />
      </Suspense>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium tabular-nums">{value}</dd>
    </div>
  );
}

async function Profile() {
  const [user, goals] = await Promise.all([getCurrentUser(), getGoals()]);

  if (!user) {
    return <p className="text-sm text-muted-foreground">No profile found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col items-center gap-3 text-center">
        <div
          className="flex size-24 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground"
          aria-hidden="true"
        >
          {initials(user.name)}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Link href="/profile/edit" className={buttonVariants({ variant: "secondary" })}>
          Edit profile
        </Link>
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold">Personal details</h2>
        <dl className="divide-y divide-border">
          {user.dateOfBirth ? (
            <>
              <Row label="Date of birth" value={formatDate(user.dateOfBirth)} />
              <Row label="Age" value={`${ageFrom(user.dateOfBirth)} years`} />
            </>
          ) : null}
          {user.heightCm !== null ? <Row label="Height" value={`${user.heightCm} cm`} /> : null}
          {user.weightKg !== null ? <Row label="Weight" value={`${user.weightKg} kg`} /> : null}
          <Row label="Member since" value={formatDate(user.createdAt)} />
        </dl>
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Daily goals</h2>
          <Link href="/goals" className="text-xs text-primary underline-offset-2 hover:underline">
            Edit
          </Link>
        </div>
        <dl className="divide-y divide-border">
          <Row label="Calories" value={`${Math.round(goals.calories)} kcal`} />
          <Row label="Carbs" value={`${Math.round(goals.carbsG)} g`} />
          <Row label="Protein" value={`${Math.round(goals.proteinG)} g`} />
          <Row label="Fat" value={`${Math.round(goals.fatG)} g`} />
        </dl>
      </section>
    </div>
  );
}
