"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type DashboardOverview = {
  stats: {
    teams: number;
    athletes: number;
    upcomingEvents: number;
    pendingInvitations: number;
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    type: string;
    startTime: string;
    teamId: string | null;
    teamName: string | null;
    rsvpStatus: string | null;
  }>;
};

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => apiClient.get<DashboardOverview>("/dashboard/overview"),
  });
}
