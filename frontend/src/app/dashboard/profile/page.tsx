"use client";

import { useAuth } from "@/lib/hooks/use-auth";

export default function ProfilePage() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <p className="text-sm text-gray-700">Loading profile...</p>;
  }

  if (auth.isError || !auth.data) {
    return (
      <p className="text-sm text-red-600">
        Failed to load profile: {auth.error instanceof Error ? auth.error.message : "Error"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Profile</p>
        <h2 className="text-2xl font-bold text-gray-900">My profile</h2>
        <p className="text-sm text-gray-600">Your account details</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <dl className="space-y-2 text-sm text-gray-800">
          <div className="flex justify-between">
            <dt className="text-gray-600">Email</dt>
            <dd className="font-medium">{auth.data.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Role</dt>
            <dd className="font-medium">{auth.data.role}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">User ID</dt>
            <dd className="font-mono text-xs">{auth.data.sub}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
