"use client";

import Link from "next/link";
import { useState } from "react";
import { useEvents } from "@/lib/hooks/use-events";
import { useAuth } from "@/lib/hooks/use-auth";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const eventTypes = [
  { value: "", label: "All types" },
  { value: "TRAINING", label: "Training" },
  { value: "MATCH", label: "Match" },
  { value: "MEETING", label: "Meeting" },
  { value: "TEST_SESSION", label: "Test Session" },
  { value: "OTHER", label: "Other" },
];

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const events = useEvents({
    page,
    search: search || undefined,
    type: type || undefined,
  });
  const auth = useAuth();

  const total = events.data?.total ?? 0;
  const pageSize = events.data?.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Events
        </p>
        <h2 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">Upcoming</h2>
        <p className="text-sm text-[var(--text-muted)]">Your events with RSVP access.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Search
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--accent)] focus:outline-none"
            placeholder="Search by title"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:max-w-xs">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Type
          </label>
          <select
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--accent)] focus:outline-none"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            {eventTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {auth.data && ["ADMIN", "STAFF", "COACH"].includes(auth.data.role) && (
          <div className="sm:ml-auto">
            <Link
              href="/dashboard/events/new"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Create event
            </Link>
          </div>
        )}
      </div>
      {events.isLoading && <p className="text-sm text-[var(--text-muted)]">Loading events...</p>}
      {events.isError && (
        <p className="text-sm text-[var(--danger)]">
          Failed to load events: {events.error instanceof Error ? events.error.message : "Error"}
        </p>
      )}
      {events.data && (
        <div className="grid gap-3">
          {events.data.items.map((event) => (
            <Card key={event.id} className="transition hover:-translate-y-0.5 hover:shadow-md">
              <Link href={`/dashboard/events/${event.id}`} className="block">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      {event.type}
                    </p>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>
                      {new Date(event.startTime).toLocaleString()}
                    </CardDescription>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">ID: {event.id}</span>
                </div>
              </Link>
            </Card>
          ))}
          {events.data.items.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No events yet.</p>
          )}
        </div>
      )}
      {events.data && events.data.items.length > 0 && (
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
