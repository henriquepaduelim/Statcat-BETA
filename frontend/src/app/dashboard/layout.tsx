"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/use-auth";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "STAFF", "COACH", "ATHLETE"] },
  { href: "/dashboard/teams", label: "Teams", roles: ["ADMIN", "STAFF", "COACH", "ATHLETE"] },
  { href: "/dashboard/athletes", label: "Athletes", roles: ["ADMIN", "STAFF"] },
  { href: "/dashboard/events", label: "Events", roles: ["ADMIN", "STAFF", "COACH", "ATHLETE"] },
  { href: "/dashboard/player-profile", label: "Player Profile", roles: ["ATHLETE"] },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const me = useAuth();
  const signout = useMutation({
    mutationFn: () => apiClient.post("/auth/signout"),
    onSuccess: () => {
      queryClient.clear();
      router.push("/signin");
    },
    onError: () => {
      queryClient.clear();
      router.push("/signin");
    },
  });

  useEffect(() => {
    if (me.isError) {
      router.push("/signin");
    }
  }, [me.isError, router]);

  if (me.isLoading || !me.data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--page-bg)] text-[var(--text-primary)]">
        <p className="text-sm text-[var(--text-muted)]">Loading your session...</p>
      </div>
    );
  }

  const filteredNav = navItems.filter((item) =>
    me.data ? item.roles.includes(me.data.role) : false,
  );

  return (
    <div className="min-h-dvh bg-[var(--page-bg)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--surface-base)] shadow-sm shadow-[rgba(15,23,42,0.04)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:py-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-base)] lg:hidden"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              <div className="space-y-1.5">
                <span className="block h-0.5 w-5 rounded-full bg-[var(--text-primary)]" />
                <span className="block h-0.5 w-5 rounded-full bg-[var(--text-primary)]" />
                <span className="block h-0.5 w-5 rounded-full bg-[var(--text-primary)]" />
              </div>
            </button>
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Statcat
              </p>
              <h1 className="text-lg font-semibold leading-tight text-[var(--text-primary)]">
                Club Manager
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <div className="hidden items-center gap-2 sm:flex">
              <Badge tone="accent">{me.data.role}</Badge>
              <span className="text-[var(--text-muted)]">{me.data.email}</span>
            </div>
            <Button
              onClick={() => signout.mutate()}
              disabled={signout.isPending}
              variant="secondary"
              size="sm"
            >
              {signout.isPending ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
        <div className="mx-auto block max-w-6xl px-4 pb-4 lg:hidden">
          {mobileNavOpen && (
            <nav className="grid gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-3 shadow-sm">
              {filteredNav.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition duration-150",
                      active
                        ? "border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                        Active
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[230px_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-4 shadow-sm shadow-[rgba(15,23,42,0.04)]">
            <div className="mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Navigation
              </p>
              <p className="text-sm text-[var(--text-secondary)]">Jump across modules</p>
            </div>
            <nav className="space-y-1.5">
              {filteredNav.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition duration-150",
                      active
                        ? "border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-primary)] shadow-sm"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
