"use client";

import Link from "next/link";
import { useTeams } from "@/lib/hooks/use-teams";

export default function TeamsPage() {
  const teams = useTeams();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Teams</p>
        <h2 className="text-2xl font-bold text-gray-900">All teams</h2>
        <p className="text-sm text-gray-600">View teams and their status.</p>
      </div>
      {teams.isLoading && <p className="text-sm text-gray-600">Loading teams...</p>}
      {teams.isError && (
        <p className="text-sm text-red-600">
          Failed to load teams: {teams.error instanceof Error ? teams.error.message : "Error"}
        </p>
      )}
      {teams.data && (
        <div className="grid gap-3">
          {teams.data.map((team) => (
            <Link
              key={team.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              href={`/dashboard/teams/${team.id}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-600">
                    {team.ageGroup || "Age group not set"} • {team.status}
                  </p>
                </div>
                <span className="text-xs text-gray-500">ID: {team.id}</span>
              </div>
            </Link>
          ))}
          {teams.data.length === 0 && (
            <p className="text-sm text-gray-600">No teams yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
