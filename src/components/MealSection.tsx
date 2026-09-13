"use client";

import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { MealEntry, MealType } from "@/lib/domain/types";
import { round1 } from "@/lib/utils";

interface Props {
  mealType: MealType;
  entries: MealEntry[];
  onAdd: (mealType: MealType) => void;
  onEdit: (entry: MealEntry) => void;
}

const MEAL_LABEL: Record<MealType, "breakfast" | "lunch" | "snack" | "dinner"> =
  {
    breakfast: "breakfast",
    lunch: "lunch",
    snack: "snack",
    dinner: "dinner",
  };

export function MealSection({ mealType, entries, onAdd, onEdit }: Props) {
  const { t } = useI18n();
  const total = entries.reduce((s, e) => s + e.calories, 0);

  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[16px] font-bold">{t(MEAL_LABEL[mealType])}</h2>
          <span className="text-[13px] font-medium text-ink-soft tabular-nums">
            {round1(total)}
          </span>
        </div>
      </header>

      {entries.length > 0 ? (
        <ul className="mt-2 divide-y divide-line">
          {entries.map((e) => (
            <li key={e.id}>
              <button
                onClick={() => onEdit(e)}
                className="flex w-full select-none items-center justify-between py-2.5 text-left active:opacity-70"
              >
                <span className="min-w-0 flex-1 pr-3">
                  <span className="block truncate text-[15px] font-medium">
                    {e.name}
                  </span>
                  {(e.serving || e.loggedTime) && (
                    <span className="block truncate text-[12px] text-ink-soft">
                      {[e.serving, e.loggedTime].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </span>
                <span className="text-[14px] font-semibold tabular-nums">
                  {round1(e.calories)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[13px] text-ink-soft">{t("noEntriesMeal")}</p>
      )}

      <button
        onClick={() => onAdd(mealType)}
        className="mt-2 flex min-h-[44px] w-full select-none items-center justify-center gap-1.5 rounded-xl bg-lime-soft text-[14px] font-semibold text-lime-strong active:opacity-80"
      >
        <Plus size={18} />
        {t("addFood")}
      </button>
    </section>
  );
}
