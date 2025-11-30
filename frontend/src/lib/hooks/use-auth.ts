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
  });
}
