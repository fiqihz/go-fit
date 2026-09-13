"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { WeightTrend } from "@/components/WeightTrend";
import { useAuth } from "@/lib/auth/provider";
import { useI18n } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import * as repo from "@/lib/supabase/repo";
import {
  sumNutrients,
  type BodyWeight,
  type MealEntry,
  type Nutrients,
  type WaterEntry,
} from "@/lib/domain/types";
import {
  addDays,
  round1,
  startOfMonthISO,
  startOfWeekISO,
  todayISO,
} from "@/lib/utils";

type Preset = "week" | "month" | "d7" | "d30" | "custom";

const PRESETS: { id: Preset; label: TranslationKey }[] = [
  { id: "week", label: "rangeThisWeek" },
  { id: "month", label: "rangeThisMonth" },
  { id: "d7", label: "range7" },
  { id: "d30", label: "range30" },
  { id: "custom", label: "rangeCustom" },
];

function rangeFor(preset: Preset, start: string, end: string): [string, string] {
  const today = todayISO();
  switch (preset) {
    case "week":
      return [startOfWeekISO(), today];
    case "month":
      return [startOfMonthISO(), today];
    case "d7":
      return [addDays(today, -6), today];
    case "d30":
      return [addDays(today, -29), today];
    case "custom":
      return start <= end ? [start, end] : [end, start];
  }
}

export default function SummaryPage() {
  return (
    <AppShell>
      <Summary />
    </AppShell>
  );
}

function Summary() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [preset, setPreset] = useState<Preset>("week");
  const [start, setStart] = useState(addDays(todayISO(), -6));
  const [end, setEnd] = useState(todayISO());
  const [entries, setEntries] = useState<MealEntry[] | null>(null);
  const [weights, setWeights] = useState<BodyWeight[]>([]);
  const [waters, setWaters] = useState<WaterEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (p: Preset, s: string, e: string) => {
      if (!user) return;
      setBusy(true);
      setError(null);
      const [rs, re] = rangeFor(p, s, e);
      try {
        const [meals, w, wat] = await Promise.all([
          repo.fetchEntriesRange(rs, re),
          repo.fetchWeightsRange(rs, re),
          repo.fetchWaterRange(rs, re),
        ]);
        setEntries(meals);
        setWeights(w);
        setWaters(wat);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (user) run("week", start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function choosePreset(p: Preset) {
    setPreset(p);
    if (p !== "custom") run(p, start, end);
  }

  const { totals, dayCount, avg, waterTotal, waterAvg } = useMemo(() => {
    const list = entries ?? [];
    const totals = sumNutrients(list);
    // Days counted = union of days with meals or water logged.
    const days = new Set<string>([
      ...list.map((e) => e.entryDate),
      ...waters.map((w) => w.entryDate),
    ]);
    const dayCount = days.size;
    const avg: Nutrients =
      dayCount > 0
        ? {
            calories: totals.calories / dayCount,
            carbs_g: totals.carbs_g / dayCount,
            fat_g: totals.fat_g / dayCount,
            protein_g: totals.protein_g / dayCount,
          }
        : { calories: 0, carbs_g: 0, fat_g: 0, protein_g: 0 };
    const waterTotal = waters.reduce((s, w) => s + w.amountMl, 0);
    const waterAvg = dayCount > 0 ? waterTotal / dayCount : 0;
    return { totals, dayCount, avg, waterTotal, waterAvg };
  }, [entries, waters]);

  const hasData = (entries?.length ?? 0) > 0 || waters.length > 0;

  return (
    <div className="pb-6">
      <h1 className="text-[22px] font-bold tracking-tight">
        {t("summaryTitle")}
      </h1>

      {/* Preset range chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = preset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => choosePreset(p.id)}
              className={`min-h-[40px] select-none rounded-full px-4 text-[13px] font-semibold transition-colors active:scale-[0.98] ${
                active
                  ? "bg-lime text-white"
                  : "bg-surface text-ink-soft"
              }`}
            >
              {t(p.label)}
            </button>
          );
        })}
      </div>

      {preset === "custom" && (
        <section className="mt-3 rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">
                {t("startDate")}
              </span>
              <input
                type="date"
                value={start}
                max={todayISO()}
                onChange={(e) => setStart(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] outline-none focus:border-lime"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">
                {t("endDate")}
              </span>
              <input
                type="date"
                value={end}
                max={todayISO()}
                onChange={(e) => setEnd(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] outline-none focus:border-lime"
              />
            </label>
          </div>
          <Button
            onClick={() => run("custom", start, end)}
            disabled={busy}
            fullWidth
            className="mt-4"
          >
            {busy ? t("loading") : t("viewSummary")}
          </Button>
        </section>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-[13px] text-danger">
          {t("loadError")}
        </p>
      )}

      <div className="mt-3 space-y-3">
        {/* Hero: weight trend */}
        <WeightTrendCard weights={weights} />

        {entries !== null && !hasData ? (
          <p className="rounded-[var(--radius-card)] bg-surface px-5 py-6 text-center text-[14px] text-ink-soft shadow-sm">
            {weights.length === 0 ? t("emptySummaryHint") : t("noDataRange")}
          </p>
        ) : hasData ? (
          <>
            <TotalsCard
              title={t("totals")}
              data={totals}
              water={waterTotal}
              sub={`${dayCount} ${t("daysLogged")}`}
            />
            <TotalsCard
              title={t("dailyAverage")}
              data={avg}
              water={waterAvg}
              sub={t("perDay")}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

function WeightTrendCard({ weights }: { weights: BodyWeight[] }) {
  const { t } = useI18n();

  if (weights.length === 0) {
    return (
      <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
        <h2 className="text-[16px] font-bold">{t("weightTrend")}</h2>
        <p className="mt-2 text-[13px] text-ink-soft">{t("noWeightTrend")}</p>
      </section>
    );
  }

  const first = weights[0].weightKg;
  const last = weights[weights.length - 1].weightKg;
  const delta = round1(last - first);
  const down = delta < 0;
  const flat = delta === 0;
  const deltaColor = flat
    ? "var(--color-ink-soft)"
    : down
      ? "var(--color-cal)"
      : "var(--color-fat)";
  const DeltaIcon = flat ? Minus : down ? ArrowDown : ArrowUp;

  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <h2 className="text-[16px] font-bold">{t("weightTrend")}</h2>
        <div
          className="flex items-center gap-1 text-[18px] font-bold tabular-nums"
          style={{ color: deltaColor }}
        >
          <DeltaIcon size={18} strokeWidth={2.6} />
          {delta > 0 ? "+" : ""}
          {delta} {t("kg")}
        </div>
      </div>

      <div className="mt-3">
        <WeightTrend points={weights} />
      </div>

      <div className="mt-3 flex items-center justify-between text-[13px]">
        <div>
          <p className="text-ink-soft">{t("weightStart")}</p>
          <p className="font-semibold tabular-nums">
            {round1(first)} {t("kg")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-ink-soft">{t("weightEnd")}</p>
          <p className="font-semibold tabular-nums">
            {round1(last)} {t("kg")}
          </p>
        </div>
      </div>
    </section>
  );
}

function TotalsCard({
  title,
  data,
  water,
  sub,
}: {
  title: string;
  data: Nutrients;
  water: number;
  sub: string;
}) {
  const { t } = useI18n();
  const rows: { label: string; value: number; unit: string; color: string }[] =
    [
      { label: t("calories"), value: data.calories, unit: t("kcal"), color: "var(--color-cal)" },
      { label: t("carbs"), value: data.carbs_g, unit: t("grams"), color: "var(--color-carb)" },
      { label: t("fat"), value: data.fat_g, unit: t("grams"), color: "var(--color-fat)" },
      { label: t("protein"), value: data.protein_g, unit: t("grams"), color: "var(--color-protein)" },
      { label: t("water"), value: water, unit: t("ml"), color: "var(--color-water)" },
    ];
  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[16px] font-bold">{title}</h2>
        <span className="text-[12px] text-ink-soft">{sub}</span>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl bg-paper p-3">
            <dt className="flex items-center gap-1.5 text-[12px] font-medium text-ink-soft">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              {r.label}
            </dt>
            <dd className="mt-1 text-[20px] font-bold tabular-nums">
              {round1(r.value)}
              <span className="ml-1 text-[12px] font-medium text-ink-soft">
                {r.unit}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
