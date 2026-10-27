import Link from "next/link";
import { Suspense } from "react";
import { updateProfile } from "@/app/actions";
import { ActionForm, FieldErrorMessage, FormInput, SubmitButton } from "@/components/action-form";
import { DatePicker } from "@/components/date-picker";
import { FreshOnOpen } from "@/components/fresh-on-open";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { todayLocal } from "@/lib/log";
import { PROFILE_LIMITS } from "@/lib/profile";
import { getCurrentUser } from "@/lib/users";

export const metadata = { title: "Edit profile · Food Ledger" };

export default function EditProfilePage() {
  return (
    <PageShell>
      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <EditForm />
          </Suspense>
        </CardContent>
      </Card>
    </PageShell>
  );
}

async function EditForm() {
  const user = await getCurrentUser();
  if (!user) return <p className="text-sm text-muted-foreground">No profile found.</p>;

  const { heightCm, weightKg, earliestBirthDate } = PROFILE_LIMITS;

  return (
    <FreshOnOpen>
      <ActionForm action={updateProfile} successMessage="Profile saved" redirectTo="/profile" className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="profile-name">Name</FieldLabel>
          <FormInput id="profile-name" name="name" required maxLength={100} defaultValue={user.name} />
          <FieldErrorMessage id="profile-name" name="name" />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-email">Email</FieldLabel>
          <FormInput
            id="profile-email"
            name="email"
            type="email"
            required
            maxLength={254}
            defaultValue={user.email}
          />
          <FieldErrorMessage id="profile-email" name="email" />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-dob">Date of birth (optional)</FieldLabel>
          <DatePicker
            id="profile-dob"
            name="date_of_birth"
            min={earliestBirthDate}
            max={todayLocal()}
            defaultValue={user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null}
          />
          <FieldErrorMessage id="profile-dob" name="date_of_birth" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="profile-height">Height in cm (optional)</FieldLabel>
            <FormInput
              id="profile-height"
              name="height_cm"
              type="number"
              min={heightCm.min}
              max={heightCm.max}
              step="any"
              defaultValue={user.heightCm ?? ""}
            />
            <FieldErrorMessage id="profile-height" name="height_cm" />
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-weight">Weight in kg (optional)</FieldLabel>
            <FormInput
              id="profile-weight"
              name="weight_kg"
              type="number"
              min={weightKg.min}
              max={weightKg.max}
              step="any"
              defaultValue={user.weightKg ?? ""}
            />
            <FieldErrorMessage id="profile-weight" name="weight_kg" />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <SubmitButton>Save changes</SubmitButton>
          <Button render={<Link href="/profile" />} nativeButton={false} variant="outline">
            Cancel
          </Button>
        </div>
      </ActionForm>
    </FreshOnOpen>
  );
}
