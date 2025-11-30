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
            className={`rounded-md border px-3 py-2 text-sm shadow-sm ${
              toast.tone === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-gray-200 bg-white text-gray-800"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span>{toast.message}</span>
              <button
                className="text-xs text-gray-500 hover:text-gray-800"
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
