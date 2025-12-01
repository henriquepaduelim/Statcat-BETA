"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type PlayerProfile = {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
  };
  athlete: {
    id: string;
    position?: string | null;
    dominantFoot?: string | null;
    status: string;
    dateOfBirth?: string | null;
    notes?: string | null;
  };
  teams: Array<{
    id: string;
    name: string;
    ageGroup?: string | null;
    status: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    type: string;
    startTime: string;
    teamId: string | null;
    teamName: string | null;
    rsvpStatus: string | null;
    attendanceStatus: string | null;
  }>;
  recentEvents: Array<{
    id: string;
    title: string;
    type: string;
    startTime: string;
    teamId: string | null;
    teamName: string | null;
    rsvpStatus: string | null;
    attendanceStatus: string | null;
  }>;
};

export function usePlayerProfile() {
  return useQuery({
    queryKey: ["player-profile"],
    queryFn: () => apiClient.get<PlayerProfile>("/player-profile"),
  });
}
