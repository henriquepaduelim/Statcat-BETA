"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type MeResponse = {
  sub: string;
  email: string;
  role: "ADMIN" | "STAFF" | "COACH" | "ATHLETE";
};

export function useAuth() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiClient.get<MeResponse>("/auth/me"),
    staleTime: 60_000,
    retry: (failureCount, error) => {
      // Do not retry unauthorized to avoid loops
      if (error instanceof Error && error.message.toLowerCase().includes("unauthorized")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
