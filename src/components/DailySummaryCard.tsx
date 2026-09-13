"use client";

import { CalorieRing } from "@/components/CalorieRing";
import { MacroBar } from "@/components/MacroBar";
import { useI18n } from "@/lib/i18n/provider";
import type { DailyGoals, Nutrients } from "@/lib/domain/types";
import { round1 } from "@/lib/utils";

interface Props {
  consumed: Nutrients;
  goals: DailyGoals;
}

export function DailySummaryCard({ consumed, goals }: Props) {
  const { t } = useI18n();

  const remaining = goals.calories - consumed.calories;
  const centerLabel = String(Math.round(Math.abs(remaining)));
  const centerSub = remaining >= 0 ? t("caloriesLeft") : t("over");

  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-5">
        <CalorieRing
          consumed={consumed.calories}
          goal={goals.calories}
          centerLabel={centerLabel}
          centerSub={centerSub}
        />
        <dl className="flex-1 space-y-2.5 text-[13px]">
          <div className="flex items-center justify-between">
            <dt className="text-ink-soft">{t("goal")}</dt>
            <dd className="font-semibold tabular-nums">
              {round1(goals.calories)} {t("kcal")}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-soft">{t("eaten")}</dt>
            <dd className="font-semibold tabular-nums">
              {round1(consumed.calories)} {t("kcal")}
            </dd>
          </div>
          <div className="h-px bg-line" />
          <div className="flex items-center justify-between">
            <dt className="text-ink-soft">{t("remaining")}</dt>
            <dd
              className="text-[17px] font-bold tabular-nums"
              style={{
                color: remaining >= 0 ? "var(--color-cal)" : "var(--color-danger)",
              }}
            >
              {round1(remaining)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 flex gap-4">
        <MacroBar
          label={t("carbs")}
          consumed={consumed.carbs_g}
          goal={goals.carbs_g}
          color="var(--color-carb)"
          unit={t("grams")}
        />
        <MacroBar
          label={t("fat")}
          consumed={consumed.fat_g}
          goal={goals.fat_g}
          color="var(--color-fat)"
          unit={t("grams")}
        />
        <MacroBar
          label={t("protein")}
          consumed={consumed.protein_g}
          goal={goals.protein_g}
          color="var(--color-protein)"
          unit={t("grams")}
        />
      </div>
    </section>
  );
}
