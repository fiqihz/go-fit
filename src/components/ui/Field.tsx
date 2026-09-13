"use client";

import { cn } from "@/lib/utils";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  suffix?: string;
}

/** Labeled input with a large touch target and optional unit suffix. */
export function Field({ label, suffix, className, id, ...props }: FieldProps) {
  const inputId = id ?? props.name;
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">
        {label}
      </span>
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            "min-h-[48px] w-full rounded-xl border border-line bg-surface px-3.5 text-[16px] text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-lime",
            suffix && "pr-12",
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] font-medium text-ink-soft">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}
