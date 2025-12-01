"use client";

import { useParams } from "next/navigation";
import {
  useAddAthleteToTeam,
  useAddCoachToTeam,
  useRemoveAthleteFromTeam,
  useRemoveCoachFromTeam,
  useTeamRoster,
} from "@/lib/hooks/use-teams";
import { useToast } from "@/lib/hooks/use-toast";
import { RoleGuard } from "@/components/role-guard";
import { FormEvent, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TeamDetailPage() {
  const params = useParams<{ id: string }>();
  const teamId = params?.id;
  const roster = useTeamRoster(teamId);
  const addAthlete = useAddAthleteToTeam(teamId);
  const removeAthlete = useRemoveAthleteFromTeam(teamId);
  const addCoach = useAddCoachToTeam(teamId);
  const removeCoach = useRemoveCoachFromTeam(teamId);
  const { push, ToastList } = useToast();
  const [athleteId, setAthleteId] = useState("");
  const [coachId, setCoachId] = useState("");

  if (roster.isLoading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading team...</p>;
  }

  if (roster.isError || !roster.data) {
    return (
      <p className="text-sm text-[var(--danger)]">
        Failed to load team roster:{" "}
        {roster.error instanceof Error ? roster.error.message : "Error"}
      </p>
    );
  }

  const { team, athletes, coaches } = roster.data;

  const handleAddAthlete = (e: FormEvent) => {
    e.preventDefault();
    if (!athleteId) return;
    addAthlete.mutate(athleteId, {
      onSuccess: () => {
        push("Athlete added");
        setAthleteId("");
      },
      onError: (err) => push(err instanceof Error ? err.message : "Add athlete failed", "error"),
    });
  };

  const handleRemoveAthlete = (id: string) => {
    removeAthlete.mutate(id, {
      onSuccess: () => push("Athlete removed"),
      onError: (err) => push(err instanceof Error ? err.message : "Remove athlete failed", "error"),
    });
  };

  const handleAddCoach = (e: FormEvent) => {
    e.preventDefault();
    if (!coachId) return;
    addCoach.mutate(coachId, {
      onSuccess: () => {
        push("Coach added");
        setCoachId("");
      },
      onError: (err) => push(err instanceof Error ? err.message : "Add coach failed", "error"),
    });
  };

  const handleRemoveCoach = (id: string) => {
    removeCoach.mutate(id, {
      onSuccess: () => push("Coach removed"),
      onError: (err) => push(err instanceof Error ? err.message : "Remove coach failed", "error"),
    });
  };

  return (
    <div className="space-y-6">
      <ToastList />
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Team
        </p>
        <h2 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">{team.name}</h2>
        <p className="text-sm text-[var(--text-muted)]">
          {team.ageGroup || "Age group not set"} • {team.status}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Athletes</CardTitle>
            <CardDescription>Assign or remove athletes from this roster.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <RoleGuard
            allow={["ADMIN", "STAFF"]}
            loadingFallback={
              <div className="h-10 w-full rounded bg-[var(--surface-muted)]" />
            }
          >
            <form onSubmit={handleAddAthlete} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Athlete ID"
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
              />
              <Button type="submit" disabled={addAthlete.isPending} size="sm">
                {addAthlete.isPending ? "Adding..." : "Add"}
              </Button>
            </form>
          </RoleGuard>
          <div className="space-y-2">
            {athletes.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No athletes assigned.</p>
            )}
            {athletes.map((athlete) => (
              <div
                key={athlete.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-[rgba(15,23,42,0.04)_0_1px_1px]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{athlete.id}</span>
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral" className="text-[11px]">
                      {athlete.status}
                    </Badge>
                  <RoleGuard allow={["ADMIN", "STAFF"]}>
                    <Button
                      type="button"
                      onClick={() => handleRemoveAthlete(athlete.id)}
                      disabled={removeAthlete.isPending}
                      variant="ghost"
                      size="sm"
                      className="text-[var(--danger-strong)] hover:bg-[var(--danger)] hover:text-white"
                    >
                      Remove
                    </Button>
                  </RoleGuard>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Position: {athlete.position || "—"} • Foot: {athlete.dominantFoot || "—"}
                </p>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coaches</CardTitle>
            <CardDescription>Manage coaches assigned to this team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <RoleGuard
            allow={["ADMIN", "STAFF"]}
            loadingFallback={
              <div className="h-10 w-full rounded bg-[var(--surface-muted)]" />
            }
          >
            <form onSubmit={handleAddCoach} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Coach ID"
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
              />
              <Button type="submit" disabled={addCoach.isPending} size="sm">
                {addCoach.isPending ? "Adding..." : "Add"}
              </Button>
            </form>
          </RoleGuard>
          <div className="space-y-2">
            {coaches.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No coaches assigned.</p>
            )}
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-[rgba(15,23,42,0.04)_0_1px_1px]"
              >
                <div className="flex items-center justify-between">
                  <span>{coach.firstName || coach.email}</span>
                  <span className="text-xs text-[var(--text-muted)]">{coach.role}</span>
                  <RoleGuard allow={["ADMIN", "STAFF"]}>
                    <Button
                      type="button"
                      onClick={() => handleRemoveCoach(coach.id)}
                      disabled={removeCoach.isPending}
                      variant="ghost"
                      size="sm"
                      className="text-[var(--danger-strong)] hover:bg-[var(--danger)] hover:text-white"
                    >
                      Remove
                    </Button>
                  </RoleGuard>
                </div>
                <p className="text-xs text-[var(--text-muted)]">ID: {coach.id}</p>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
