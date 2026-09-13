"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { addDays, fromISODate, todayISO } from "@/lib/utils";

interface Props {
  date: string;
  onChange: (date: string) => void;
}

/** Day stepper with a native date picker; supports any back-date. */
export function DateNavigator({ date, onChange }: Props) {
  const { lang, t } = useI18n();
  const isToday = date === todayISO();

  const label = isToday
    ? t("today")
    : fromISODate(date).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

  const weekday = fromISODate(date).toLocaleDateString(
    lang === "id" ? "id-ID" : "en-US",
    { weekday: "long" },
  );

  return (
    <div className="flex items-center justify-between">
      <button
        aria-label="Previous day"
        onClick={() => onChange(addDays(date, -1))}
        className="flex min-h-[44px] min-w-[44px] select-none items-center justify-center rounded-full text-ink-soft active:bg-line/60"
      >
        <ChevronLeft size={22} />
      </button>

      <label className="relative flex min-h-[44px] cursor-pointer select-none items-center gap-2 rounded-xl px-3 active:bg-line/60">
        <CalendarDays size={18} className="text-lime-strong" />
        <span className="flex flex-col items-start">
          <span className="text-[17px] font-bold leading-tight">{label}</span>
          <span className="text-[12px] text-ink-soft">{weekday}</span>
        </span>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Pick date"
        />
      </label>

      <button
        aria-label="Next day"
        disabled={isToday}
        onClick={() => onChange(addDays(date, 1))}
        className="flex min-h-[44px] min-w-[44px] select-none items-center justify-center rounded-full text-ink-soft active:bg-line/60 disabled:opacity-30"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}
