"use client";

import { cn } from "@/lib/utils";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  suffix?: string;
}

/** Labeled input with a large touch target and optional unit suffix. */
export function Field({ label, suffix, className, id, ...props }: FieldProps) {
  const inputId = id ?? props.name;

  // Decimal inputs: render as type="text" instead of type="number". On iOS a
  // number input with a comma-locale keyboard disables the "," key (spec allows
  // only "." as decimal), so users can't type "73,5". type="text" +
  // inputMode="decimal" keeps the numeric keypad but lets the comma through;
  // parseNum() normalizes "," → "." on save. Whole-number inputs (numeric) keep
  // type="number" with step="any".
  const typeProps: React.InputHTMLAttributes<HTMLInputElement> = {};
  if (props.type === "number" && props.inputMode === "decimal") {
    typeProps.type = "text";
    typeProps.pattern = "[0-9]*[.,]?[0-9]*";
  } else if (props.type === "number" && props.step === undefined) {
    typeProps.step = "any";
  }

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
          {...typeProps}
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
