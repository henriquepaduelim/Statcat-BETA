"use client";

import { usePlayerProfile } from "@/lib/hooks/use-player-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-semibold text-[var(--text-primary)]">
        {value || "—"}
      </span>
    </div>
  );
}

export default function PlayerProfilePage() {
  const profile = usePlayerProfile();

  if (profile.isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((key) => (
          <div
            key={key}
            className="h-24 w-full animate-pulse rounded-2xl bg-[var(--surface-muted)]"
          />
        ))}
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <div className="rounded-2xl border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger-strong)]">
        Failed to load player profile:{" "}
        {profile.error instanceof Error ? profile.error.message : "Error"}
      </div>
    );
  }

  const { user, athlete, teams, upcomingEvents, recentEvents } = profile.data;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Player profile
        </p>
        <h1 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">
          {user.firstName || user.lastName
            ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
            : user.email}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Your personal profile, teams, events, and performance placeholders.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Account and athlete details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Status" value={athlete.status} />
          <InfoRow label="Position" value={athlete.position} />
          <InfoRow label="Dominant foot" value={athlete.dominantFoot} />
          <InfoRow
            label="Date of birth"
            value={athlete.dateOfBirth ? new Date(athlete.dateOfBirth).toLocaleDateString() : "—"}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>Your current teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {teams.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No teams assigned.</p>
            )}
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{team.name}</p>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    {team.ageGroup || "Age group not set"} • {team.status}
                  </p>
                </div>
                <Badge tone="neutral" className="text-[11px]">
                  {team.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming events</CardTitle>
            <CardDescription>RSVP and attendance status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No upcoming events.</p>
            )}
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      {event.type}
                    </p>
                    <p className="font-semibold text-[var(--text-primary)]">{event.title}</p>
                  </div>
                  {event.rsvpStatus && (
                    <Badge tone="neutral" className="text-[11px]">
                      RSVP: {event.rsvpStatus}
                    </Badge>
                  )}
                </div>
                <p className="text-[12px] text-[var(--text-muted)]">
                  {new Date(event.startTime).toLocaleString()}
                  {event.teamName ? ` • ${event.teamName}` : ""}
                </p>
                {event.attendanceStatus && (
                  <p className="text-[12px] text-[var(--text-muted)]">
                    Attendance: {event.attendanceStatus}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Combines / tests</CardTitle>
            <CardDescription>Performance metrics will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">
              Coming soon: latest results and trends for sprints, jumps, Yo-Yo, etc.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Report cards</CardTitle>
            <CardDescription>Evaluations and feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--text-muted)]">
              Coming soon: recent report cards, status (pending/approved), and feedback.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event history</CardTitle>
          <CardDescription>Recent events and your RSVP/attendance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentEvents.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No recent events.</p>
          )}
          {recentEvents.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {event.type}
                  </p>
                  <p className="font-semibold text-[var(--text-primary)]">{event.title}</p>
                </div>
                {event.rsvpStatus && (
                  <Badge tone="neutral" className="text-[11px]">
                    RSVP: {event.rsvpStatus}
                  </Badge>
                )}
              </div>
              <p className="text-[12px] text-[var(--text-muted)]">
                {new Date(event.startTime).toLocaleString()}
                {event.teamName ? ` • ${event.teamName}` : ""}
              </p>
              {event.attendanceStatus && (
                <p className="text-[12px] text-[var(--text-muted)]">
                  Attendance: {event.attendanceStatus}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
