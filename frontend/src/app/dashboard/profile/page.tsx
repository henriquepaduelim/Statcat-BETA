"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading profile...</p>;
  }

  if (auth.isError || !auth.data) {
    return (
      <p className="text-sm text-[var(--danger)]">
        Failed to load profile: {auth.error instanceof Error ? auth.error.message : "Error"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Profile
        </p>
        <h2 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">My profile</h2>
        <p className="text-sm text-[var(--text-muted)]">Your account details</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Identity and role information.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--text-muted)]">Email</dt>
              <dd className="font-medium text-[var(--text-primary)]">{auth.data.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--text-muted)]">Role</dt>
              <dd>
                <Badge tone="accent">{auth.data.role}</Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--text-muted)]">User ID</dt>
              <dd className="font-mono text-xs text-[var(--text-primary)]">{auth.data.sub}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
