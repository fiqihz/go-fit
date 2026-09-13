"use client";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-lime text-white active:bg-lime-strong disabled:opacity-50",
  secondary:
    "bg-lime-soft text-lime-strong active:opacity-80 disabled:opacity-50",
  ghost:
    "bg-transparent text-ink-soft active:bg-line/60 disabled:opacity-50",
  danger:
    "bg-transparent text-danger active:bg-danger/10 disabled:opacity-50",
};

/** Touch-first button: >=44px target, active feedback, no hover reliance. */
export function Button({
  variant = "primary",
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-[44px] select-none items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition-transform active:scale-[0.98]",
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
