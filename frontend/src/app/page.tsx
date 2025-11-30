export default function Home() {
  return (
    <main className="min-h-dvh bg-white text-gray-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
        <section className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Statcat Club Manager
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to your club workspace
          </h1>
          <p className="text-base text-gray-600">
            Sign in to manage teams, athletes, and events. This frontend shell is
            ready for auth wiring and dashboard pages.
          </p>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Next steps</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
              <li>Hook up the sign-in page to the API.</li>
              <li>Wire protected layouts with role-aware navigation.</li>
              <li>Build team, athlete, and event screens.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            <p className="mt-2 text-sm text-gray-700">
              React Query is configured; Tailwind is available. Add API calls and
              pages under <code className="rounded bg-gray-100 px-1">app/</code>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
