"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { LanguageToggle } from "@/components/LanguageToggle";
import { IntroTour } from "@/components/IntroTour";
import { useAuth } from "@/lib/auth/provider";
import { useI18n } from "@/lib/i18n/provider";
import * as repo from "@/lib/supabase/repo";
import { markTourSeen } from "@/lib/tour";
import { parseNum } from "@/lib/utils";
import type { DailyGoals } from "@/lib/domain/types";

export default function OnboardingPage() {
  const { t } = useI18n();
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  const [calories, setCalories] = useState("2000");
  const [carbs, setCarbs] = useState("250");
  const [fat, setFat] = useState("65");
  const [protein, setProtein] = useState("150");
  const [water, setWater] = useState("2500");
  const [busy, setBusy] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Guard: must be signed in; skip if already onboarded.
  useEffect(() => {
    if (loading) return;
    if (configured && !user) {
      router.replace("/login");
      return;
    }
    if (user) {
      repo
        .fetchOnboarded()
        .then((done) => {
          if (done) router.replace("/");
        })
        .catch(() => {
          // If the check fails, stay on onboarding — saving still works.
        });
    }
  }, [loading, configured, user, router]);

  async function finish(markOnboarded: boolean) {
    setBusy(true);
    const goals: DailyGoals = {
      calories: Math.max(0, parseNum(calories)),
      carbs_g: Math.max(0, parseNum(carbs)),
      fat_g: Math.max(0, parseNum(fat)),
      protein_g: Math.max(0, parseNum(protein)),
      waterMl: Math.max(0, parseNum(water)),
    };
    try {
      await repo.saveGoals(goals, { onboarded: markOnboarded });
      // Show the intro tour once, then head to the diary.
      setShowTour(true);
    } finally {
      setBusy(false);
    }
  }

  function closeTour() {
    markTourSeen();
    setShowTour(false);
    router.replace("/");
  }

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-10 pt-[calc(env(safe-area-inset-top)+24px)]">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime text-white">
            <Target size={28} />
          </div>
          <h1 className="text-[24px] font-bold tracking-tight">
            {t("onboardTitle")}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-[14px] text-ink-soft">
            {t("onboardSubtitle")}
          </p>
        </div>

        <p className="mb-4 rounded-xl bg-lime-soft px-4 py-3 text-[13px] text-lime-strong">
          {t("onboardContext")}
        </p>

        <div className="space-y-3.5">
          <Field
            label={t("targetCalories")}
            name="ocal"
            type="number"
            inputMode="decimal"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            suffix={t("kcal")}
          />
          <div className="grid grid-cols-3 gap-3">
            <Field
              label={t("targetCarbs")}
              name="ocarb"
              type="number"
              inputMode="decimal"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              suffix={t("grams")}
            />
            <Field
              label={t("targetFat")}
              name="ofat"
              type="number"
              inputMode="decimal"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              suffix={t("grams")}
            />
            <Field
              label={t("targetProtein")}
              name="oprot"
              type="number"
              inputMode="decimal"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              suffix={t("grams")}
            />
          </div>
          <Field
            label={t("targetWater")}
            name="owater"
            type="number"
            inputMode="numeric"
            value={water}
            onChange={(e) => setWater(e.target.value)}
            suffix={t("ml")}
          />

          <Button
            onClick={() => finish(true)}
            disabled={busy}
            fullWidth
            className="mt-1"
          >
            {busy ? t("saving") : t("getStarted")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => finish(true)}
            disabled={busy}
            fullWidth
          >
            {t("skipForNow")}
          </Button>
        </div>
      </div>

      <IntroTour open={showTour} onClose={closeTour} />
    </main>
  );
}
