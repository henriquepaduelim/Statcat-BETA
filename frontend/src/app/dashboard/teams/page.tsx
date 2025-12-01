"use client";

import Link from "next/link";
import { useTeams } from "@/lib/hooks/use-teams";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function TeamsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const teams = useTeams({ page, search: search || undefined, status: status || undefined });

  const total = teams.data?.total ?? 0;
  const pageSize = teams.data?.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Teams
        </p>
        <h2 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">All teams</h2>
        <p className="text-sm text-[var(--text-muted)]">View teams and their status.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Search
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--accent)] focus:outline-none"
            placeholder="Search by name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:max-w-xs">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Status
          </label>
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--accent)] focus:outline-none"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>
      {teams.isLoading && <p className="text-sm text-[var(--text-muted)]">Loading teams...</p>}
      {teams.isError && (
        <p className="text-sm text-[var(--danger)]">
          Failed to load teams: {teams.error instanceof Error ? teams.error.message : "Error"}
        </p>
      )}
      {teams.data && (
        <div className="grid gap-3">
          {teams.data.items.map((team) => (
            <Link
              key={team.id}
              className="block rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-4 shadow-sm shadow-[rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-md"
              href={`/dashboard/teams/${team.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{team.name}</CardTitle>
                  <CardDescription>
                    {team.ageGroup || "Age group not set"} • {team.status}
                  </CardDescription>
                </div>
                <span className="text-xs text-[var(--text-muted)]">ID: {team.id}</span>
              </div>
            </Link>
          ))}
          {teams.data.items.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No teams yet.</p>
          )}
        </div>
      )}
      {teams.data && teams.data.items.length > 0 && (
        <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
          <span>
            Page {page} of {totalPages} • {total} total
          </span>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-sm disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-sm disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
