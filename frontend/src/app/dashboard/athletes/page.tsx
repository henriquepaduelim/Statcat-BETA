"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { RoleGuard } from "@/components/role-guard";

type Athlete = {
  id: string;
  userId: string;
  position?: string | null;
  dominantFoot?: string | null;
  status: string;
};

export default function AthletesPage() {
  const athletes = useQuery({
    queryKey: ["athletes"],
    queryFn: () => apiClient.get<Athlete[]>("/athletes"),
  });

  return (
    <RoleGuard allow={["ADMIN", "STAFF"]}>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Athletes
          </p>
          <h2 className="text-2xl font-bold text-gray-900">All athletes</h2>
          <p className="text-sm text-gray-600">
            Profiles and statuses. Admin/Staff only.
          </p>
        </div>
        {athletes.isLoading && <p className="text-sm text-gray-600">Loading athletes...</p>}
        {athletes.isError && (
          <p className="text-sm text-red-600">
            Failed to load athletes:{" "}
            {athletes.error instanceof Error ? athletes.error.message : "Error"}
          </p>
        )}
        {athletes.data && (
          <div className="grid gap-3">
            {athletes.data.map((athlete) => (
              <div
                key={athlete.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Athlete {athlete.id}</h3>
                    <p className="text-sm text-gray-600">
                      User: {athlete.userId} • {athlete.position || "Position"} •{" "}
                      {athlete.dominantFoot || "Foot"} • {athlete.status}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">ID: {athlete.id}</span>
                </div>
              </div>
            ))}
            {athletes.data.length === 0 && (
              <p className="text-sm text-gray-600">No athletes yet.</p>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
