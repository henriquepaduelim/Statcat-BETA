"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { useDashboardOverview } from "@/lib/hooks/use-dashboard-overview";
import { useTeams, useDeleteTeam } from "@/lib/hooks/use-teams";
import { useEvents, useEvent } from "@/lib/hooks/use-events";
import { useAuth } from "@/lib/hooks/use-auth";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/lib/hooks/use-toast";

function StatValue({
  value,
  loading,
}: {
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <span className="text-3xl font-bold text-[var(--text-primary)]">
      {loading || value === undefined ? "—" : value}
    </span>
  );
}

export default function DashboardPage() {
  const overview = useDashboardOverview();
  const auth = useAuth();
  const loading = overview.isLoading;
  const error = overview.isError ? overview.error : null;
  const stats = overview.data?.stats;
  const overviewEvents = overview.data?.upcomingEvents ?? [];

  const teams = useTeams({ page: 1, pageSize: 5 });
  const events = useEvents({ page: 1, pageSize: 5 });
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined);
  const eventDetail = useEvent(selectedEventId);
  const deleteTeam = useDeleteTeam();
  const queryClient = useQueryClient();
  const { push, ToastList } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const [coachTeamId, setCoachTeamId] = useState<string>("");
  const [coachId, setCoachId] = useState<string>("");
  const addCoach = useMutation({
    mutationFn: () => apiClient.post(`/teams/${coachTeamId}/coaches`, { coachId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setCoachId("");
      const teamName =
        teams.data?.items.find((team) => team.id === coachTeamId)?.name || "team";
      push(`Coach added to ${teamName}`);
    },
    onError: (err) => {
      push(err instanceof Error ? err.message : "Add coach failed", "error");
    },
  });

  const handleDeleteTeam = (teamId: string) => {
    const team = teams.data?.items.find((t) => t.id === teamId);
    setConfirmDelete(team ? { id: team.id, name: team.name } : { id: teamId, name: "team" });
  };

  const confirmDeleteTeam = () => {
    if (!confirmDelete) return;
    deleteTeam.mutate(confirmDelete.id, {
      onSuccess: () => push(`Team "${confirmDelete.name}" deleted`),
      onError: (err) => push(err instanceof Error ? err.message : "Delete team failed", "error"),
    });
    setConfirmDelete(null);
  };

  const rsvp = useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: "YES" | "NO" | "MAYBE" }) =>
      apiClient.post(`/events/${eventId}/rsvp`, { status }),
    onSuccess: (_data, variables) => {
      push(`RSVP ${variables.status} saved`);
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      if (selectedEventId === variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ["event", selectedEventId] });
      }
    },
    onError: (err) => push(err instanceof Error ? err.message : "RSVP failed", "error"),
  });

  return (
    <div className="space-y-6">
      <ToastList />
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Overview
        </p>
        <h2 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">Dashboard</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Quick glance at your club activity. Upcoming events, teams, and athletes will appear here.
        </p>
      </div>
      {error && (
        <Card className="border-[var(--danger)] bg-[var(--danger-soft)]">
          <CardContent>
            <p className="text-sm text-[var(--danger-strong)]">
              Failed to load overview: {error instanceof Error ? error.message : "Error"}
            </p>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Upcoming events</CardDescription>
            <CardTitle className="text-3xl">
              <StatValue value={stats?.upcomingEvents} loading={loading} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[var(--text-muted)]">
              RSVPs and reminders will display here
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Teams</CardDescription>
            <CardTitle className="text-3xl">
              <StatValue value={stats?.teams} loading={loading} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[var(--text-muted)]">Manage rosters and coaches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Athletes</CardDescription>
            <CardTitle className="text-3xl">
              <StatValue value={stats?.athletes} loading={loading} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[var(--text-muted)]">Profiles and statuses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pending invitations</CardDescription>
            <CardTitle className="text-3xl">
              <StatValue value={stats?.pendingInvitations} loading={loading} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[var(--text-muted)]">Invites awaiting your RSVP</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Leaderboards</CardTitle>
            <CardDescription>Top performers by metric and age group.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <select className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--accent)] focus:outline-none" defaultValue="">
                <option value="">Metric</option>
                <option value="sprint10m">Sprint 10m</option>
                <option value="sprint20m">Sprint 20m</option>
                <option value="vertical">Vertical jump</option>
                <option value="yoyo">Yo-Yo</option>
                <option value="goals">Goals</option>
              </select>
              <select className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--accent)] focus:outline-none" defaultValue="">
                <option value="">Age group</option>
                <option value="u16">U16</option>
                <option value="u18">U18</option>
                <option value="u20">U20</option>
                <option value="first">First team</option>
              </select>
              <select className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--accent)] focus:outline-none" defaultValue="">
                <option value="">Team</option>
                <option value="all">All teams</option>
                {teams.data?.items.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Coming soon: rankings by sprint, jump, Yo-Yo, goals with filters applied.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coaches</CardTitle>
            <CardDescription>Add or manage coaches quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--text-muted)]">
            <p>Select a team and add a coach by ID.</p>
            <div className="flex flex-col gap-2">
              <select
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--accent)] focus:outline-none"
                value={coachTeamId}
                onChange={(e) => setCoachTeamId(e.target.value)}
                disabled={teams.isLoading || teams.isError}
              >
                <option value="">Select team</option>
                {teams.data?.items.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <input
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--accent)] focus:outline-none"
                placeholder="Coach ID"
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
              />
              <button
                className={buttonClasses({ variant: "secondary", size: "sm" })}
                onClick={() => addCoach.mutate()}
                disabled={!coachTeamId || !coachId || addCoach.isPending}
              >
                {addCoach.isPending ? "Adding..." : "Add coach"}
              </button>
              {(addCoach.isError || addCoach.isSuccess) && (
                <p
                  className={`text-xs ${addCoach.isError ? "text-[var(--danger)]" : "text-[var(--text-muted)]"}`}
                >
                  {addCoach.isError
                    ? addCoach.error instanceof Error
                      ? addCoach.error.message
                      : "Add coach failed"
                    : "Coach added"}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/teams" className={buttonClasses({ variant: "ghost", size: "sm" })}>
                Manage on teams
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>Recent teams with quick actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {teams.isLoading && <p className="text-sm text-[var(--text-muted)]">Loading teams...</p>}
            {teams.isError && (
              <p className="text-sm text-[var(--danger)]">
                Failed to load teams: {teams.error instanceof Error ? teams.error.message : "Error"}
              </p>
            )}
            {teams.data &&
              teams.data.items.map((team) => (
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
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/teams/${team.id}`}
                      className={buttonClasses({ variant: "secondary", size: "sm" })}
                    >
                      Edit
                    </Link>
                    {auth.data && ["ADMIN", "STAFF"].includes(auth.data.role) && (
                      <button
                        className={buttonClasses({ variant: "ghost", size: "sm" })}
                        onClick={() => handleDeleteTeam(team.id)}
                        disabled={deleteTeam.isPending}
                      >
                        {deleteTeam.isPending ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            {teams.data && teams.data.items.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No teams yet.</p>
            )}
            <div className="pt-1 text-xs text-[var(--text-muted)]">
              <Link href="/dashboard/teams" className="underline">
                Go to teams
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Calendar & events</CardTitle>
              <CardDescription>Upcoming events with quick access.</CardDescription>
            </div>
            <Link href="/dashboard/events/new" className={buttonClasses({ variant: "secondary", size: "sm" })}>
              Create event
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {events.isLoading && <p className="text-sm text-[var(--text-muted)]">Loading events...</p>}
            {events.isError && (
              <p className="text-sm text-[var(--danger)]">
                Failed to load events: {events.error instanceof Error ? events.error.message : "Error"}
              </p>
            )}
            {events.data &&
              events.data.items.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {event.type}
                    </p>
                    <p className="font-semibold text-[var(--text-primary)]">{event.title}</p>
                    <p className="text-[12px] text-[var(--text-muted)]">
                      {new Date(event.startTime).toLocaleString()}
                    </p>
                  </div>
                  <button
                    className={buttonClasses({ variant: "ghost", size: "sm" })}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    View roster
                  </button>
                </div>
              ))}
            {events.data && events.data.items.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No events yet.</p>
            )}
            {events.data && events.data.items.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Select event to view roster
                </label>
                <select
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--accent)] focus:outline-none"
                  value={selectedEventId ?? ""}
                  onChange={(e) => setSelectedEventId(e.target.value || undefined)}
                >
                  <option value="">Choose an event</option>
                  {events.data.items.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} — {new Date(event.startTime).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="pt-1 text-xs text-[var(--text-muted)]">
              <Link href="/dashboard/events" className="underline">
                Go to events
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Event roster & RSVP</CardTitle>
            <CardDescription>Attendance and RSVP for the selected event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedEventId && (
              <p className="text-sm text-[var(--text-muted)]">
                Select an event to view its roster and RSVP status.
              </p>
            )}
            {selectedEventId && eventDetail.isLoading && (
              <p className="text-sm text-[var(--text-muted)]">Loading roster...</p>
            )}
            {selectedEventId && eventDetail.isError && (
              <p className="text-sm text-[var(--danger)]">
                Failed to load roster:{" "}
                {eventDetail.error instanceof Error ? eventDetail.error.message : "Error"}
              </p>
            )}
            {selectedEventId && eventDetail.data && (
              <div className="space-y-2">
                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {eventDetail.data.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {eventDetail.data.type} • {eventDetail.data.location || "Location TBD"} •{" "}
                    {new Date(eventDetail.data.startTime).toLocaleString()}
                  </p>
                </div>
                {eventDetail.data.invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-[var(--text-primary)]">User: {inv.userId}</p>
                      <p className="text-[12px] text-[var(--text-muted)]">
                        RSVP: {inv.rsvpStatus} • Attendance: {inv.attendanceStatus}
                      </p>
                    </div>
                  </div>
                ))}
                {eventDetail.data.invitations.length === 0 && (
                  <p className="text-sm text-[var(--text-muted)]">No invitations for this event.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team workflows</CardTitle>
            <CardDescription>Quick actions for reports and tests.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--text-muted)]">
            <div className="flex flex-col gap-2">
              <Link href="/dashboard/events/new" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                Create event / session
              </Link>
              <button className={buttonClasses({ variant: "secondary", size: "sm" })} disabled>
                Create game report (coming soon)
              </button>
              <button className={buttonClasses({ variant: "secondary", size: "sm" })} disabled>
                Capture combine/test data (coming soon)
              </button>
              <button className={buttonClasses({ variant: "secondary", size: "sm" })} disabled>
                Add athlete report card (coming soon)
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming events</CardTitle>
          <CardDescription>Your next events with team context and RSVP.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map((key) => (
                <div
                  key={key}
                  className="h-12 w-full animate-pulse rounded-lg bg-[var(--surface-muted)]"
                />
              ))}
            </div>
          )}
          {!loading && overviewEvents.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No upcoming events.</p>
          )}
          {!loading &&
            overviewEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      {event.type}
                    </p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {event.title}
                    </p>
                  </div>
                  {event.rsvpStatus && (
                    <Badge tone="neutral" className="text-[11px]">
                      RSVP: {event.rsvpStatus}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {new Date(event.startTime).toLocaleString()}
                  {event.teamName ? ` • ${event.teamName}` : ""}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(["YES", "MAYBE", "NO"] as const).map((status) => (
                    <button
                      key={status}
                      className={buttonClasses({ variant: "ghost", size: "sm" })}
                      onClick={() => rsvp.mutate({ eventId: event.id, status })}
                      disabled={rsvp.isPending}
                    >
                      RSVP {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Delete team?</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              This will remove <span className="font-semibold text-[var(--text-primary)]">{confirmDelete.name}</span>.
              Are you sure you want to proceed?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className={buttonClasses({ variant: "ghost", size: "sm" })}
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className={buttonClasses({ variant: "danger", size: "sm" })}
                onClick={confirmDeleteTeam}
                disabled={deleteTeam.isPending}
              >
                {deleteTeam.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
