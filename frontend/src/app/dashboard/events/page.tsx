"use client";

import Link from "next/link";
import { useEvents } from "@/lib/hooks/use-events";
import { useAuth } from "@/lib/hooks/use-auth";

export default function EventsPage() {
  const events = useEvents();
  const auth = useAuth();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Events
        </p>
        <h2 className="text-2xl font-bold text-gray-900">Upcoming</h2>
        <p className="text-sm text-gray-600">Your events with RSVP access.</p>
      </div>
      {auth.data && ["ADMIN", "STAFF", "COACH"].includes(auth.data.role) && (
        <div>
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
          >
            Create event
          </Link>
        </div>
      )}
      {events.isLoading && <p className="text-sm text-gray-600">Loading events...</p>}
      {events.isError && (
        <p className="text-sm text-red-600">
          Failed to load events: {events.error instanceof Error ? events.error.message : "Error"}
        </p>
      )}
      {events.data && (
        <div className="grid gap-3">
          {events.data.map((event) => (
            <Link
              key={event.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              href={`/dashboard/events/${event.id}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{event.type}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(event.startTime).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs text-gray-500">ID: {event.id}</span>
              </div>
            </Link>
          ))}
          {events.data.length === 0 && (
            <p className="text-sm text-gray-600">No events yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
