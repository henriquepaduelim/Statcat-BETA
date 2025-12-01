"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type Event = {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime?: string | null;
  teamId?: string | null;
};

export type PaginatedEvents = {
  items: Event[];
  total: number;
  page: number;
  pageSize: number;
};

export type EventDetail = Event & {
  description?: string | null;
  location?: string | null;
  invitations: Array<{
    id: string;
    userId: string;
    rsvpStatus: string;
    attendanceStatus: string;
  }>;
};

export type EventsQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  teamId?: string;
};

export function useEvents(params: EventsQueryParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.type) searchParams.set("type", params.type);
  if (params.teamId) searchParams.set("teamId", params.teamId);
  const queryString = searchParams.toString();

  return useQuery({
    queryKey: ["events", params],
    queryFn: () =>
      apiClient.get<PaginatedEvents>(`/events${queryString ? `?${queryString}` : ""}`),
  });
}

export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => apiClient.get<EventDetail>(`/events/${eventId}`),
    enabled: Boolean(eventId),
  });
}

export function useRsvp(eventId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: "YES" | "NO" | "MAYBE") =>
      apiClient.post(`/events/${eventId}/rsvp`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      if (eventId) {
        qc.invalidateQueries({ queryKey: ["event", eventId] });
      }
    },
  });
}

export function useInvite(eventId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.post(`/events/${eventId}/invitations`, { userId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      if (eventId) {
        qc.invalidateQueries({ queryKey: ["event", eventId] });
      }
    },
  });
}
