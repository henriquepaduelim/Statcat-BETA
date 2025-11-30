"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "STAFF", "COACH", "ATHLETE"] },
  { href: "/dashboard/teams", label: "Teams", roles: ["ADMIN", "STAFF", "COACH", "ATHLETE"] },
  { href: "/dashboard/athletes", label: "Athletes", roles: ["ADMIN", "STAFF"] },
  { href: "/dashboard/events", label: "Events", roles: ["ADMIN", "STAFF", "COACH", "ATHLETE"] },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const me = useAuth();
  const signout = useMutation({
    mutationFn: () => apiClient.post("/auth/signout"),
    onSuccess: () => {
      queryClient.clear();
      router.push("/signin");
    },
  });

  useEffect(() => {
    if (me.isError) {
      router.push("/signin");
    }
  }, [me.isError, router]);

  if (me.isError) {
    return null;
  }

  if (me.isLoading || !me.data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white text-gray-900">
        <p className="text-sm text-gray-700">Loading your session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Statcat</p>
            <h1 className="text-lg font-semibold">Club Manager</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <>
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-900">
                {me.data.role}
              </span>
              <span>{me.data.email}</span>
              <button
                onClick={() => signout.mutate()}
                disabled={signout.isPending}
                className="rounded-md border border-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-50"
              >
                {signout.isPending ? "Signing out..." : "Sign out"}
              </button>
            </>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-3">
          {navItems
            .filter((item) => (me.data ? item.roles.includes(me.data.role) : false))
            .map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
