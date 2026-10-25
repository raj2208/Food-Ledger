import Link from "next/link";
import { Suspense } from "react";
import { updateProfile } from "@/app/actions";
import { buttonClass, ghostButtonClass, inputClass } from "@/components/food-fields";
import { FreshOnOpen } from "@/components/fresh-on-open";
import { PageShell } from "@/components/page-shell";
import { PROFILE_LIMITS } from "@/lib/profile";
import { todayLocal } from "@/lib/log";
import { getCurrentUser } from "@/lib/users";

export const metadata = { title: "Edit profile · Food Ledger" };

export default function EditProfilePage() {
  return (
    <PageShell>
      <section>
        <h1 className="mb-4 text-lg font-semibold">Edit profile</h1>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <EditForm />
        </Suspense>
      </section>
    </PageShell>
  );
}

const label = "flex flex-col gap-1 text-xs font-medium text-muted-foreground";

async function EditForm() {
  const user = await getCurrentUser();
  if (!user) return <p className="text-sm text-muted-foreground">No profile found.</p>;

  const { heightCm, weightKg, earliestBirthDate } = PROFILE_LIMITS;

  return (
    <FreshOnOpen>
      <form action={updateProfile} className="flex flex-col gap-4">
        <label className={label}>
          Name
          <input name="name" required maxLength={100} defaultValue={user.name} className={inputClass} />
        </label>
        <label className={label}>
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            defaultValue={user.email}
            className={inputClass}
          />
        </label>
        <label className={label}>
          Date of birth (optional)
          <input
            name="date_of_birth"
            type="date"
            min={earliestBirthDate}
            max={todayLocal()}
            defaultValue={user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : ""}
            className={inputClass}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className={label}>
            Height in cm (optional)
            <input
              name="height_cm"
              type="number"
              min={heightCm.min}
              max={heightCm.max}
              step="any"
              defaultValue={user.heightCm ?? ""}
              className={inputClass}
            />
          </label>
          <label className={label}>
            Weight in kg (optional)
            <input
              name="weight_kg"
              type="number"
              min={weightKg.min}
              max={weightKg.max}
              step="any"
              defaultValue={user.weightKg ?? ""}
              className={inputClass}
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className={buttonClass}>
            Save changes
          </button>
          <Link href="/profile" className={`${ghostButtonClass} py-2 text-sm`}>
            Cancel
          </Link>
        </div>
      </form>
    </FreshOnOpen>
  );
}
