"use client";

import { clamp01, round1 } from "@/lib/utils";

interface MacroBarProps {
  label: string;
  consumed: number;
  goal: number;
  color: string; // CSS var reference, e.g. "var(--color-carb)"
  unit: string;
}

/** A single macro progress bar with its own hue. */
export function MacroBar({ label, consumed, goal, color, unit }: MacroBarProps) {
  const ratio = goal > 0 ? clamp01(consumed / goal) : 0;
  return (
    <div className="flex-1">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[12px] font-semibold text-ink-soft">{label}</span>
        <span className="text-[12px] font-medium text-ink-soft tabular-nums">
          {round1(consumed)}
          <span className="text-ink-soft/60">/{round1(goal)}{unit}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full"
          style={{
            width: `${ratio * 100}%`,
            backgroundColor: color,
            transition: "width 500ms ease",
          }}
        />
      </div>
    </div>
  );
}
