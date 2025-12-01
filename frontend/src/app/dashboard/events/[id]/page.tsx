"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useEvent, useInvite, useRsvp } from "@/lib/hooks/use-events";
import { useToast } from "@/lib/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = params?.id;
  const event = useEvent(eventId);
  const rsvp = useRsvp(eventId);
  const invite = useInvite(eventId);
  const { push, ToastList } = useToast();
  const [invitee, setInvitee] = useState("");

  if (event.isLoading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading event...</p>;
  }

  if (event.isError || !event.data) {
    return (
      <p className="text-sm text-[var(--danger)]">
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
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Event
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">
            {event.data.title}
          </h2>
          <Badge tone="accent" className="text-xs uppercase tracking-wide">
            {event.data.type}
          </Badge>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          {new Date(event.data.startTime).toLocaleString()}
        </p>
        {event.data.description && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{event.data.description}</p>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>RSVP</CardTitle>
          <CardDescription>Respond to the invitation or update attendance.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(["YES", "MAYBE", "NO"] as const).map((status) => (
            <Button
              key={status}
              onClick={() => onRsvp(status)}
              disabled={rsvp.isPending}
              variant={status === "NO" ? "ghost" : "secondary"}
              size="sm"
              className={
                status === "NO" ? "text-[var(--danger-strong)] hover:bg-[var(--surface-muted)]" : ""
              }
            >
              RSVP {status}
            </Button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>Invite additional users to this event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={onInvite} className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="User ID to invite"
              value={invitee}
              onChange={(e) => setInvitee(e.target.value)}
            />
            <Button type="submit" disabled={invite.isPending} size="sm">
              {invite.isPending ? "Inviting..." : "Invite"}
            </Button>
          </form>
          {event.data.invitations.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No invitations yet.</p>
          )}
          <div className="space-y-2">
            {event.data.invitations.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-[rgba(15,23,42,0.04)_0_1px_1px]"
              >
                <div className="flex items-center justify-between">
                  <span>User: {inv.userId}</span>
                  <Badge tone="neutral" className="text-[11px]">
                    {inv.rsvpStatus}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Attendance: {inv.attendanceStatus}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
