"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useEvent, useInvite, useRsvp } from "@/lib/hooks/use-events";
import { useToast } from "@/lib/hooks/use-toast";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = params?.id;
  const event = useEvent(eventId);
  const rsvp = useRsvp(eventId);
  const invite = useInvite(eventId);
  const { push, ToastList } = useToast();
  const [invitee, setInvitee] = useState("");

  if (event.isLoading) {
    return <p className="text-sm text-gray-700">Loading event...</p>;
  }

  if (event.isError || !event.data) {
    return (
      <p className="text-sm text-red-600">
        Failed to load event: {event.error instanceof Error ? event.error.message : "Error"}
      </p>
    );
  }

  const onRsvp = (status: "YES" | "NO" | "MAYBE") => {
    rsvp.mutate(status, {
      onError: (err) => {
        push(err instanceof Error ? err.message : "RSVP failed", "error");
      },
      onSuccess: () => {
        push("RSVP updated");
      },
    });
  };

  const onInvite = (e: FormEvent) => {
    e.preventDefault();
    if (!invitee) return;
    invite.mutate(invitee, {
      onSuccess: () => {
        push("User invited");
        setInvitee("");
      },
      onError: (err) => {
        push(err instanceof Error ? err.message : "Invite failed", "error");
      },
    });
  };

  return (
    <div className="space-y-4">
      <ToastList />
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Event</p>
        <h2 className="text-2xl font-bold text-gray-900">{event.data.title}</h2>
        <p className="text-sm text-gray-600">
          {event.data.type} • {new Date(event.data.startTime).toLocaleString()}
        </p>
        {event.data.description && (
          <p className="text-sm text-gray-700 mt-2">{event.data.description}</p>
        )}
      </div>
      <div className="flex gap-2">
        {(["YES", "MAYBE", "NO"] as const).map((status) => (
          <button
            key={status}
            onClick={() => onRsvp(status)}
            disabled={rsvp.isPending}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500"
          >
            RSVP {status}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Invitations</h3>
        <form onSubmit={onInvite} className="flex flex-col gap-2 sm:flex-row">
          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-gray-400 focus:outline-none"
            placeholder="User ID to invite"
            value={invitee}
            onChange={(e) => setInvitee(e.target.value)}
          />
          <button
            type="submit"
            disabled={invite.isPending}
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {invite.isPending ? "Inviting..." : "Invite"}
          </button>
        </form>
        {event.data.invitations.length === 0 && (
          <p className="text-sm text-gray-600">No invitations yet.</p>
        )}
        {event.data.invitations.map((inv) => (
          <div
            key={inv.id}
            className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-800"
          >
            <div className="flex items-center justify-between">
              <span>User: {inv.userId}</span>
              <span className="text-xs text-gray-600">{inv.rsvpStatus}</span>
            </div>
            <p className="text-xs text-gray-600">Attendance: {inv.attendanceStatus}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
