import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-dvh bg-[var(--page-bg)] text-[var(--text-primary)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Statcat Club Manager
          </p>
          <h1 className="text-3xl font-bold leading-tight">
            Welcome to your club workspace
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            Sign in to manage teams, athletes, and events. This frontend shell is
            ready for auth wiring and dashboard pages.
          </p>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <Card className="bg-[var(--surface-muted)]">
            <CardHeader>
              <CardTitle>Next steps</CardTitle>
              <CardDescription>Key actions to get the workspace live.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--text-primary)]">
                <li>Hook up the sign-in page to the API.</li>
                <li>Wire protected layouts with role-aware navigation.</li>
                <li>Build team, athlete, and event screens.</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>What is ready in this build</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)]">
                React Query is configured; Tailwind is available. Add API calls and
                pages under <code className="rounded bg-[var(--surface-muted)] px-1 py-0.5">app/</code>.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
