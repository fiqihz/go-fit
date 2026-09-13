"use client";

import { clamp01 } from "@/lib/utils";

interface CalorieRingProps {
  consumed: number;
  goal: number;
  centerLabel: string;
  centerSub: string;
}

/**
 * The diary hero: a single large progress ring for calories. The ring is the
 * memorable element of the screen, so everything around it stays quiet.
 */
export function CalorieRing({
  consumed,
  goal,
  centerLabel,
  centerSub,
}: CalorieRingProps) {
  const size = 176;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const ratio = goal > 0 ? clamp01(consumed / goal) : 0;
  const over = goal > 0 && consumed > goal;
  const dash = circ * ratio;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={over ? "var(--color-danger)" : "var(--color-cal)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 500ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[34px] font-bold leading-none tracking-tight text-ink tabular-nums">
          {centerLabel}
        </span>
        <span className="mt-1 text-[13px] font-medium text-ink-soft">
          {centerSub}
        </span>
      </div>
    </div>
  );
}
