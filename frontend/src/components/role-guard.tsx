"use client";

import { PropsWithChildren, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

type Role = "ADMIN" | "STAFF" | "COACH" | "ATHLETE";

type RoleGuardProps = PropsWithChildren<{
  allow: Role[];
  redirect?: string;
  loadingFallback?: React.ReactNode;
}>;

export function RoleGuard({
  allow,
  redirect = "/dashboard",
  loadingFallback,
  children,
}: RoleGuardProps) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isError) {
      router.push("/signin");
    }
  }, [auth.isError, router]);

  useEffect(() => {
    if (auth.data && !allow.includes(auth.data.role)) {
      router.push(redirect);
    }
  }, [auth.data, allow, redirect, router]);

  if (auth.isLoading || !auth.data) {
    return loadingFallback ? (
      <>{loadingFallback}</>
    ) : (
      <div className="flex min-h-dvh items-center justify-center bg-white text-gray-900">
        <p className="text-sm text-gray-700">Checking access...</p>
      </div>
    );
  }

  if (!allow.includes(auth.data.role)) {
    return null;
  }

  return <>{children}</>;
}
