"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

type SignInDto = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SignInDto>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: SignInDto) =>
      apiClient.post("/auth/signin", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/dashboard");
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Sign in failed");
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate(form);
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--page-bg)] px-4 py-12 text-[var(--text-primary)]">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Statcat Club Manager
          </p>
          <h1 className="text-3xl font-bold leading-tight">Sign in</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Access your teams, athletes, and events.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Use your credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--text-secondary)]" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--text-secondary)]" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-[var(--danger)]" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="text-center text-sm text-[var(--text-muted)]">
          <Link href="/" className="font-medium text-[var(--text-primary)] underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
