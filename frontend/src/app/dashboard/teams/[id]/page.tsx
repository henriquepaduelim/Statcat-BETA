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
    return <p className="text-sm text-gray-700">Loading team...</p>;
  }

  if (roster.isError || !roster.data) {
    return (
      <p className="text-sm text-red-600">
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
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Team
        </p>
        <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
        <p className="text-sm text-gray-600">
          {team.ageGroup || "Age group not set"} • {team.status}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Athletes</h3>
          <RoleGuard
            allow={["ADMIN", "STAFF"]}
            loadingFallback={<div className="h-10 w-full rounded bg-gray-100" />}
          >
            <form onSubmit={handleAddAthlete} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-gray-400 focus:outline-none"
                placeholder="Athlete ID"
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
              />
              <button
                type="submit"
                disabled={addAthlete.isPending}
                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {addAthlete.isPending ? "Adding..." : "Add"}
              </button>
            </form>
          </RoleGuard>
          <div className="mt-3 space-y-2">
            {athletes.length === 0 && (
              <p className="text-sm text-gray-600">No athletes assigned.</p>
            )}
            {athletes.map((athlete) => (
              <div
                key={athlete.id}
                className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-800"
              >
                <div className="flex items-center justify-between">
                  <span>{athlete.id}</span>
                  <span className="text-xs text-gray-600">{athlete.status}</span>
                  <RoleGuard allow={["ADMIN", "STAFF"]}>
                    <button
                      type="button"
                      onClick={() => handleRemoveAthlete(athlete.id)}
                      disabled={removeAthlete.isPending}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </RoleGuard>
                </div>
                <p className="text-xs text-gray-600">
                  Position: {athlete.position || "—"} • Foot: {athlete.dominantFoot || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Coaches</h3>
          <RoleGuard
            allow={["ADMIN", "STAFF"]}
            loadingFallback={<div className="h-10 w-full rounded bg-gray-100" />}
          >
            <form onSubmit={handleAddCoach} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-gray-400 focus:outline-none"
                placeholder="Coach ID"
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
              />
              <button
                type="submit"
                disabled={addCoach.isPending}
                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {addCoach.isPending ? "Adding..." : "Add"}
              </button>
            </form>
          </RoleGuard>
          <div className="mt-3 space-y-2">
            {coaches.length === 0 && (
              <p className="text-sm text-gray-600">No coaches assigned.</p>
            )}
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-800"
              >
                <div className="flex items-center justify-between">
                  <span>{coach.firstName || coach.email}</span>
                  <span className="text-xs text-gray-600">{coach.role}</span>
                  <RoleGuard allow={["ADMIN", "STAFF"]}>
                    <button
                      type="button"
                      onClick={() => handleRemoveCoach(coach.id)}
                      disabled={removeCoach.isPending}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </RoleGuard>
                </div>
                <p className="text-xs text-gray-600">ID: {coach.id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
