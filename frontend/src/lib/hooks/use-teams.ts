"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type Team = {
  id: string;
  name: string;
  ageGroup?: string | null;
  status: string;
};

export type PaginatedTeams = {
  items: Team[];
  total: number;
  page: number;
  pageSize: number;
};

export type RosterResponse = {
  team: {
    id: string;
    name: string;
    ageGroup?: string | null;
    status: string;
  };
  athletes: Array<{
    id: string;
    userId: string;
    position?: string | null;
    dominantFoot?: string | null;
    status: string;
  }>;
  coaches: Array<{
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
  }>;
};

export type TeamsQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
};

export function useTeams(params: TeamsQueryParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  const queryString = searchParams.toString();

  return useQuery({
    queryKey: ["teams", params],
    queryFn: () =>
      apiClient.get<PaginatedTeams>(`/teams${queryString ? `?${queryString}` : ""}`),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => apiClient.del(`/teams/${teamId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useTeamRoster(teamId: string | undefined) {
  return useQuery({
    queryKey: ["team", teamId, "roster"],
    queryFn: () => apiClient.get<RosterResponse>(`/teams/${teamId}/roster`),
    enabled: Boolean(teamId),
  });
}

export function useAddAthleteToTeam(teamId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (athleteId: string) =>
      apiClient.post(`/teams/${teamId}/athletes`, { athleteId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team", teamId, "roster"] });
    },
  });
}

export function useRemoveAthleteFromTeam(teamId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (athleteId: string) =>
      apiClient.del(`/teams/${teamId}/athletes/${athleteId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team", teamId, "roster"] });
    },
  });
}

export function useAddCoachToTeam(teamId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (coachId: string) => apiClient.post(`/teams/${teamId}/coaches`, { coachId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team", teamId, "roster"] });
    },
  });
}

export function useRemoveCoachFromTeam(teamId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (coachId: string) => apiClient.del(`/teams/${teamId}/coaches/${coachId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team", teamId, "roster"] });
    },
  });
}

export function useInviteToEvent(eventId: string | undefined) {
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
