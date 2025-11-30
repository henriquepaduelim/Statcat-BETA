"use client";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Overview
        </p>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-600">
          Quick glance at your club activity. Upcoming events, teams, and athletes will appear here.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Upcoming events</p>
          <p className="text-3xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-500">RSVPs and reminders will display here</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Teams</p>
          <p className="text-3xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-500">Manage rosters and coaches</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Athletes</p>
          <p className="text-3xl font-bold text-gray-900">—</p>
          <p className="text-xs text-gray-500">Profiles and statuses</p>
        </div>
      </div>
    </div>
  );
}
