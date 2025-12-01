"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { RoleGuard } from "@/components/role-guard";
import { useToast } from "@/lib/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CreateEventDto = {
  title: string;
  type: string;
  startTime: string;
  endTime?: string;
  teamId?: string;
};

type CreatedEventResponse = {
  id: string;
};

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateEventDto>({
    title: "",
    type: "TRAINING",
    startTime: "",
    endTime: "",
    teamId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const { push, ToastList } = useToast();

  const mutation = useMutation({
    mutationFn: (payload: CreateEventDto) => apiClient.post("/events", payload),
    onSuccess: (data: CreatedEventResponse) => {
      push("Event created");
      router.push(`/dashboard/events/${data.id}`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to create event";
      setError(msg);
      push(msg, "error");
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate({
      ...form,
      teamId: form.teamId || undefined,
      endTime: form.endTime || undefined,
    });
  };

  return (
    <RoleGuard allow={["ADMIN", "STAFF", "COACH"]}>
      <div className="space-y-4">
        <ToastList />
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Events
          </p>
          <h2 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">
            Create event
          </h2>
          <p className="text-sm text-[var(--text-muted)]">Admins/Staff/Coaches can create events.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Event details</CardTitle>
            <CardDescription>Set the main information for this event.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--text-secondary)]">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--text-secondary)]">Type</label>
                <select
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm shadow-[rgba(15,23,42,0.04)] transition focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-0"
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                >
                  <option value="TRAINING">Training</option>
                  <option value="MATCH">Match</option>
                  <option value="MEETING">Meeting</option>
                  <option value="TEST_SESSION">Test Session</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--text-secondary)]">
                    Start time
                  </label>
                  <Input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--text-secondary)]">
                    End time
                  </label>
                  <Input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--text-secondary)]">
                  Team ID (optional)
                </label>
                <Input
                  value={form.teamId}
                  onChange={(e) => setForm((prev) => ({ ...prev, teamId: e.target.value }))}
                  placeholder="cuid..."
                />
                <p className="text-xs text-[var(--text-muted)]">Must be a valid team ID if provided.</p>
              </div>
              {error && (
                <p className="text-sm text-[var(--danger)]" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? "Creating..." : "Create event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
