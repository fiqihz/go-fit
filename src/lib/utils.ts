import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Local date as YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a YYYY-MM-DD string into a local Date (midnight local). */
export function fromISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Shift an ISO date string by a number of days. */
export function addDays(iso: string, delta: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + delta);
  return toISODate(d);
}

/** Today's date as YYYY-MM-DD (local). */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Monday of the current week (ISO week start), as YYYY-MM-DD. */
export function startOfWeekISO(): string {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - dow);
  return toISODate(d);
}

/** First day of the current month, as YYYY-MM-DD. */
export function startOfMonthISO(): string {
  const d = new Date();
  return toISODate(new Date(d.getFullYear(), d.getMonth(), 1));
}

/** Round to at most one decimal, dropping a trailing ".0". */
export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Clamp a ratio to 0..1. */
export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/**
 * Parse user-entered numeric text into a number, tolerating a comma decimal
 * separator (e.g. "65,7" → 65.7) that some mobile keyboards produce. Returns 0
 * for empty/invalid input.
 */
export function parseNum(value: string): number {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return 0;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}
