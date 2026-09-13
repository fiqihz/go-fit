"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/lib/auth/provider";
import { useI18n } from "@/lib/i18n/provider";
import { useDiaryStore } from "@/lib/store/diary-store";
import { parseNum } from "@/lib/utils";
import type { DailyGoals } from "@/lib/domain/types";

export default function SettingsPage() {
  return (
    <AppShell>
      <Settings />
    </AppShell>
  );
}

function Settings() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const goals = useDiaryStore((s) => s.goals);
  const loadAll = useDiaryStore((s) => s.loadAll);
  const saveGoals = useDiaryStore((s) => s.saveGoals);
  const reset = useDiaryStore((s) => s.reset);

  const [calories, setCalories] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [protein, setProtein] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  useEffect(() => {
    setCalories(String(goals.calories));
    setCarbs(String(goals.carbs_g));
    setFat(String(goals.fat_g));
    setProtein(String(goals.protein_g));
  }, [goals]);

  async function handleSave() {
    setBusy(true);
    setSaved(false);
    const next: DailyGoals = {
      calories: Math.max(0, parseNum(calories)),
      carbs_g: Math.max(0, parseNum(carbs)),
      fat_g: Math.max(0, parseNum(fat)),
      protein_g: Math.max(0, parseNum(protein)),
    };
    try {
      await saveGoals(next);
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    reset();
    router.replace("/login");
  }

  return (
    <div className="pb-6">
      <h1 className="text-[22px] font-bold tracking-tight">
        {t("navSettings")}
      </h1>

      <div className="mt-4 space-y-3">
        <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
          <h2 className="text-[16px] font-bold">{t("dailyTargets")}</h2>
          <p className="mt-1 text-[13px] text-ink-soft">{t("targetsHelp")}</p>

          <div className="mt-4 space-y-3.5">
            <Field
              label={t("targetCalories")}
              name="tcal"
              type="number"
              inputMode="decimal"
              value={calories}
              onChange={(e) => {
                setCalories(e.target.value);
                setSaved(false);
              }}
              suffix={t("kcal")}
            />
            <div className="grid grid-cols-3 gap-3">
              <Field
                label={t("targetCarbs")}
                name="tcarb"
                type="number"
                inputMode="decimal"
                value={carbs}
                onChange={(e) => {
                  setCarbs(e.target.value);
                  setSaved(false);
                }}
                suffix={t("grams")}
              />
              <Field
                label={t("targetFat")}
                name="tfat"
                type="number"
                inputMode="decimal"
                value={fat}
                onChange={(e) => {
                  setFat(e.target.value);
                  setSaved(false);
                }}
                suffix={t("grams")}
              />
              <Field
                label={t("targetProtein")}
                name="tprot"
                type="number"
                inputMode="decimal"
                value={protein}
                onChange={(e) => {
                  setProtein(e.target.value);
                  setSaved(false);
                }}
                suffix={t("grams")}
              />
            </div>
            <Button onClick={handleSave} disabled={busy} fullWidth>
              {busy ? t("saving") : t("saveTargets")}
            </Button>
            {saved && (
              <p className="text-center text-[13px] text-lime-strong">
                {t("targetsSaved")}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold">{t("language")}</h2>
            <LanguageToggle />
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
          <h2 className="text-[16px] font-bold">{t("account")}</h2>
          {user?.email && (
            <p className="mt-1 text-[13px] text-ink-soft">{user.email}</p>
          )}
          <Button
            variant="danger"
            onClick={handleSignOut}
            className="mt-3 justify-start px-0"
          >
            <LogOut size={18} />
            {t("signOut")}
          </Button>
        </section>
      </div>
    </div>
  );
}
