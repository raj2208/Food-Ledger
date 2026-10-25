import Link from "next/link";
import { Fragment, Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { getGoals } from "@/lib/goals";
import { ageFrom, formatDate, initials } from "@/lib/profile";
import { getCurrentUser } from "@/lib/users";

export const metadata = { title: "Profile · Food Ledger" };

export default function ProfilePage() {
  return (
    <PageShell>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <Profile />
      </Suspense>
    </PageShell>
  );
}

// Label on the left, value on the right, a separator between rows.
function Rows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <ItemGroup className="gap-0">
      {rows.map((r, i) => (
        <Fragment key={r.label}>
          {i > 0 ? <ItemSeparator className="my-0" /> : null}
          <Item size="sm" className="px-0">
            <ItemContent>
              <ItemTitle className="font-normal text-muted-foreground">{r.label}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <span className="text-sm font-medium tabular-nums">{r.value}</span>
            </ItemActions>
          </Item>
        </Fragment>
      ))}
    </ItemGroup>
  );
}

async function Profile() {
  const [user, goals] = await Promise.all([getCurrentUser(), getGoals()]);

  if (!user) {
    return <p className="text-sm text-muted-foreground">No profile found.</p>;
  }

  const details = [
    ...(user.dateOfBirth
      ? [
          { label: "Date of birth", value: formatDate(user.dateOfBirth) },
          { label: "Age", value: `${ageFrom(user.dateOfBirth)} years` },
        ]
      : []),
    ...(user.heightCm !== null ? [{ label: "Height", value: `${user.heightCm} cm` }] : []),
    ...(user.weightKg !== null ? [{ label: "Weight", value: `${user.weightKg} kg` }] : []),
    { label: "Member since", value: formatDate(user.createdAt) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col items-center gap-3 text-center">
        <Avatar className="size-24 text-3xl">
          <AvatarFallback className="bg-primary text-3xl font-semibold text-primary-foreground">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button render={<Link href="/profile/edit" />} nativeButton={false} variant="secondary">
          Edit profile
        </Button>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
        </CardHeader>
        <CardContent>
          <Rows rows={details} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily goals</CardTitle>
          <CardAction>
            <Button render={<Link href="/goals" />} nativeButton={false} variant="link" size="sm">
              Edit
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Rows
            rows={[
              { label: "Calories", value: `${Math.round(goals.calories)} kcal` },
              { label: "Carbs", value: `${Math.round(goals.carbsG)} g` },
              { label: "Protein", value: `${Math.round(goals.proteinG)} g` },
              { label: "Fat", value: `${Math.round(goals.fatG)} g` },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
