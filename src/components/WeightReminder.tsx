"use client";

import Link from "next/link";
import { Scale, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { useReminderStore } from "@/lib/store/reminder-store";

/**
 * Quiet in-app nudge shown on the diary when today's weight isn't logged yet.
 * Non-blocking: a single tappable card that routes to the weight screen.
 */
export function WeightReminder() {
  const { t } = useI18n();
  const logged = useReminderStore((s) => s.weightLoggedToday);

  // Only show once we've confirmed it's missing.
  if (logged !== false) return null;

  return (
    <Link
      href="/weight"
      className="flex select-none items-center gap-3 rounded-[var(--radius-card)] border border-lime/25 bg-lime-soft px-4 py-3 active:opacity-80"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime text-white">
        <Scale size={18} />
      </span>
      <span className="flex-1 text-[14px] font-semibold text-lime-strong">
        {t("weightReminderTitle")}
      </span>
      <span className="flex items-center gap-0.5 text-[13px] font-semibold text-lime-strong">
        {t("weightReminderCta")}
        <ChevronRight size={16} />
      </span>
    </Link>
  );
}
