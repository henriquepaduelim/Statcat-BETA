"use client";

import { useState, useCallback } from "react";

export type Toast = { id: number; message: string; tone?: "info" | "error" };

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Toast["tone"] = "info") => {
    setToasts((prev) => [...prev, { id: Date.now(), message, tone }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastList = () => (
    <div className="fixed inset-x-0 top-4 flex justify-center px-4">
      <div className="flex w-full max-w-md flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 text-sm shadow-sm shadow-[rgba(15,23,42,0.08)] backdrop-blur ${
              toast.tone === "error"
                ? "border-[var(--danger-strong)] bg-[var(--danger-soft)] text-[var(--danger-strong)]"
                : "border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-primary)]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span>{toast.message}</span>
              <button
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                onClick={() => remove(toast.id)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return { push, remove, ToastList };
}
