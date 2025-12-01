import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "muted";

const toneClasses: Record<Tone, string> = {
  neutral:
    "border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-secondary)]",
  accent:
    "border border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--text-primary)]",
  muted: "border border-transparent bg-transparent text-[var(--text-muted)]",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
