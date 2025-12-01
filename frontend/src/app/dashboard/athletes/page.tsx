"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { RoleGuard } from "@/components/role-guard";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useState } from "react";

type Athlete = {
  id: string;
  userId: string;
  position?: string | null;
  dominantFoot?: string | null;
  status: string;
};

type AthleteWithUser = Athlete & { user?: { email?: string } };

type PaginatedAthletes = {
  items: AthleteWithUser[];
  total: number;
  page: number;
  pageSize: number;
};

export default function AthletesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const athletes = useQuery({
    queryKey: ["athletes", { page, search, status }],
    queryFn: () =>
      apiClient.get<PaginatedAthletes>(
        `/athletes?${new URLSearchParams({
          page: String(page),
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        }).toString()}`,
      ),
  });

  const total = athletes.data?.total ?? 0;
  const pageSize = athletes.data?.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <RoleGuard allow={["ADMIN", "STAFF"]}>
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Athletes
          </p>
          <h2 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">All athletes</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Profiles and statuses. Admin/Staff only.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-xs">
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Search
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--accent)] focus:outline-none"
              placeholder="Search by id, position, email"
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
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
        {athletes.isLoading && <p className="text-sm text-[var(--text-muted)]">Loading athletes...</p>}
        {athletes.isError && (
          <p className="text-sm text-[var(--danger)]">
            Failed to load athletes:{" "}
            {athletes.error instanceof Error ? athletes.error.message : "Error"}
          </p>
        )}
        {athletes.data && (
          <div className="grid gap-3">
            {athletes.data.items.map((athlete) => (
              <Card key={athlete.id} className="transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Athlete {athlete.id}</CardTitle>
                    <CardDescription>
                      User: {athlete.user?.email || athlete.userId} • {athlete.position || "Position"} •{" "}
                      {athlete.dominantFoot || "Foot"} • {athlete.status}
                    </CardDescription>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">ID: {athlete.id}</span>
                </div>
              </Card>
            ))}
            {athletes.data.items.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No athletes yet.</p>
            )}
          </div>
        )}
        {athletes.data && athletes.data.items.length > 0 && (
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
    </RoleGuard>
  );
}
