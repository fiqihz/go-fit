"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DateNavigator } from "@/components/DateNavigator";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useAuth } from "@/lib/auth/provider";
import { useI18n } from "@/lib/i18n/provider";
import * as repo from "@/lib/supabase/repo";
import { useReminderStore } from "@/lib/store/reminder-store";
import type { BodyWeight } from "@/lib/domain/types";
import { addDays, round1, todayISO } from "@/lib/utils";

export default function WeightPage() {
  return (
    <AppShell>
      <Weight />
    </AppShell>
  );
}

function Weight() {
  const { user } = useAuth();
  const { t, lang } = useI18n();

  const [date, setDate] = useState(todayISO());
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<BodyWeight[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const current = await repo.fetchWeight(date);
      setValue(current ? String(current.weightKg) : "");
      const end = todayISO();
      const start = addDays(end, -29);
      const range = await repo.fetchWeightsRange(start, end);
      setHistory(range.slice().reverse());
    } catch (e) {
      setError((e as Error).message);
    }
  }, [user, date]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    const w = Number(value);
    if (!w || w <= 0) return;
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      await repo.saveWeight(date, w);
      setSaved(true);
      if (date === todayISO()) useReminderStore.getState().markLogged();
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const latest = history[0];
  const previous = history[1];
  const delta =
    latest && previous ? round1(latest.weightKg - previous.weightKg) : null;

  return (
    <div className="pb-6">
      <DateNavigator
        date={date}
        onChange={(d) => {
          setDate(d);
          setSaved(false);
        }}
      />

      <div className="mt-4 space-y-3">
        <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
          <h1 className="mb-3 text-[16px] font-bold">{t("weightToday")}</h1>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field
                label={t("bodyWeight")}
                name="weight"
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setSaved(false);
                }}
                placeholder={t("weightPlaceholder")}
                suffix={t("kg")}
              />
            </div>
            <Button onClick={handleSave} disabled={busy || !Number(value)}>
              {busy ? t("saving") : t("saveWeight")}
            </Button>
          </div>
          {saved && (
            <p className="mt-2 text-[13px] text-lime-strong">{t("weightSaved")}</p>
          )}
          {error && (
            <p className="mt-2 text-[13px] text-danger">{t("loadError")}</p>
          )}
        </section>

        {latest && (
          <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-ink-soft">{t("latest")}</p>
                <p className="text-[26px] font-bold tabular-nums">
                  {round1(latest.weightKg)}{" "}
                  <span className="text-[15px] font-medium text-ink-soft">
                    {t("kg")}
                  </span>
                </p>
              </div>
              {delta !== null && (
                <div className="text-right">
                  <p className="text-[13px] text-ink-soft">{t("change")}</p>
                  <p
                    className="text-[18px] font-bold tabular-nums"
                    style={{
                      color:
                        delta <= 0 ? "var(--color-cal)" : "var(--color-fat)",
                    }}
                  >
                    {delta > 0 ? "+" : ""}
                    {delta} {t("kg")}
                  </p>
                </div>
              )}
            </div>

            <ul className="mt-4 divide-y divide-line">
              {history.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between py-2.5 text-[14px]"
                >
                  <span className="text-ink-soft">
                    {new Date(h.entryDate + "T00:00:00").toLocaleDateString(
                      lang === "id" ? "id-ID" : "en-US",
                      { weekday: "short", day: "numeric", month: "short" },
                    )}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {round1(h.weightKg)} {t("kg")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!latest && (
          <p className="py-4 text-center text-[13px] text-ink-soft">
            {t("noWeightRange")}
          </p>
        )}
      </div>
    </div>
  );
}
