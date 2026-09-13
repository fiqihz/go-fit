"use client";

import { useId } from "react";
import type { BodyWeight } from "@/lib/domain/types";

interface Props {
  points: BodyWeight[]; // ascending by date
  /** Line/area color; falls back to the trend direction color. */
  color?: string;
}

/**
 * A hand-built weight sparkline. No chart dependency — an SVG area chart with a
 * soft gradient fill, a smooth line, and marked start/end points. The chart is
 * the memorable element on the summary screen, so it carries some weight
 * (gradient, end-point emphasis) while everything around it stays quiet.
 */
export function WeightTrend({ points, color }: Props) {
  const gradId = useId();
  const width = 320;
  const height = 96;
  const pad = 10;

  if (points.length === 0) return null;

  const values = points.map((p) => p.weightKg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  // Single data point: render a flat midline with one dot.
  const n = points.length;
  const xFor = (i: number) =>
    n === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (n - 1);
  const yFor = (v: number) =>
    height - pad - ((v - min) / span) * (height - pad * 2);

  const coords = points.map((p, i) => ({ x: xFor(i), y: yFor(p.weightKg) }));
  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L ${coords[n - 1].x.toFixed(1)} ${height - pad} L ${coords[0].x.toFixed(1)} ${height - pad} Z`;

  const first = points[0].weightKg;
  const last = points[n - 1].weightKg;
  // Losing weight reads as "on track" (lime); gaining reads as clay.
  const trendColor =
    color ?? (last <= first ? "var(--color-cal)" : "var(--color-fat)");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-24 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Weight trend"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trendColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {n > 1 && <path d={area} fill={`url(#${gradId})`} />}
      <path
        d={line}
        fill="none"
        stroke={trendColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Start point: hollow. End point: filled emphasis. */}
      <circle
        cx={coords[0].x}
        cy={coords[0].y}
        r={4}
        fill="var(--color-surface)"
        stroke={trendColor}
        strokeWidth={2.5}
      />
      <circle
        cx={coords[n - 1].x}
        cy={coords[n - 1].y}
        r={4.5}
        fill={trendColor}
      />
    </svg>
  );
}
