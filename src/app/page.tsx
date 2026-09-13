"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DateNavigator } from "@/components/DateNavigator";
import { DailySummaryCard } from "@/components/DailySummaryCard";
import { MealSection } from "@/components/MealSection";
import { AddFoodSheet, type AddFoodTarget } from "@/components/AddFoodSheet";
import { WeightReminder } from "@/components/WeightReminder";
import { useAuth } from "@/lib/auth/provider";
import { useI18n } from "@/lib/i18n/provider";
import {
  groupByMeal,
  totalForEntries,
  useDiaryStore,
} from "@/lib/store/diary-store";
import { useReminderStore } from "@/lib/store/reminder-store";
import { MEAL_TYPES, type MealEntry, type MealType } from "@/lib/domain/types";

export default function DiaryPage() {
  return (
    <AppShell>
      <Diary />
    </AppShell>
  );
}

function Diary() {
  const { user } = useAuth();
  const { t } = useI18n();

  const date = useDiaryStore((s) => s.date);
  const goals = useDiaryStore((s) => s.goals);
  const entries = useDiaryStore((s) => s.entries);
  const loading = useDiaryStore((s) => s.loading);
  const error = useDiaryStore((s) => s.error);
  const setDate = useDiaryStore((s) => s.setDate);
  const loadAll = useDiaryStore((s) => s.loadAll);

  const refreshReminder = useReminderStore((s) => s.refresh);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState<AddFoodTarget | null>(null);

  useEffect(() => {
    if (user) {
      loadAll();
      refreshReminder();
    }
  }, [user, loadAll, refreshReminder]);

  const groups = groupByMeal(entries);
  const consumed = totalForEntries(entries);

  function openAdd(mealType: MealType) {
    setTarget({ mealType });
    setSheetOpen(true);
  }
  function openEdit(entry: MealEntry) {
    setTarget({ mealType: entry.mealType, entry });
    setSheetOpen(true);
  }

  return (
    <div className="pb-6">
      <DateNavigator date={date} onChange={setDate} />

      <div className="mt-4 space-y-3">
        <WeightReminder />
        <DailySummaryCard consumed={consumed} goals={goals} />

        {error && (
          <p className="rounded-xl bg-danger/10 px-4 py-3 text-[13px] text-danger">
            {t("loadError")}
          </p>
        )}

        {!loading && entries.length === 0 && (
          <p className="rounded-xl bg-lime-soft px-4 py-3 text-[13px] text-lime-strong">
            {t("emptyDiaryHint")}
          </p>
        )}

        {MEAL_TYPES.map((meal) => (
          <MealSection
            key={meal}
            mealType={meal}
            entries={groups[meal]}
            onAdd={openAdd}
            onEdit={openEdit}
          />
        ))}

        {loading && (
          <p className="py-2 text-center text-[13px] text-ink-soft">
            {t("loading")}
          </p>
        )}
      </div>

      <AddFoodSheet
        open={sheetOpen}
        target={target}
        date={date}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
