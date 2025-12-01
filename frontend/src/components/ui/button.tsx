"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

type ButtonStyleOptions = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm hover:bg-[var(--accent-strong)] focus-visible:outline-[var(--accent)]",
  secondary:
    "border border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-muted)] focus-visible:outline-[var(--accent)]",
  ghost:
    "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] focus-visible:outline-[var(--accent)]",
  danger:
    "bg-[var(--danger)] text-white shadow-sm hover:bg-[var(--danger-strong)] focus-visible:outline-[var(--danger)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
});
