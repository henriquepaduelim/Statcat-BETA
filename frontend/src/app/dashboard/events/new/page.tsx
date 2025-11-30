"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { RoleGuard } from "@/components/role-guard";
import { useToast } from "@/lib/hooks/use-toast";

type CreateEventDto = {
  title: string;
  type: string;
  startTime: string;
  endTime?: string;
  teamId?: string;
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
    onSuccess: (data: any) => {
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
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Events
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Create event</h2>
          <p className="text-sm text-gray-600">Admins/Staff/Coaches can create events.</p>
        </div>
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Title</label>
            <input
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-gray-400 focus:outline-none"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Type</label>
            <select
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-gray-400 focus:outline-none"
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
              <label className="block text-sm font-medium text-gray-800">Start time</label>
              <input
                type="datetime-local"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-gray-400 focus:outline-none"
                value={form.startTime}
                onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">End time</label>
              <input
                type="datetime-local"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-gray-400 focus:outline-none"
                value={form.endTime}
                onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Team ID (optional)</label>
            <input
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-gray-400 focus:outline-none"
              value={form.teamId}
              onChange={(e) => setForm((prev) => ({ ...prev, teamId: e.target.value }))}
              placeholder="cuid..."
            />
            <p className="text-xs text-gray-500">Must be a valid team ID if provided.</p>
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {mutation.isPending ? "Creating..." : "Create event"}
          </button>
        </form>
      </div>
    </RoleGuard>
  );
}
