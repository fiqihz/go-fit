"use client";

import { useState } from "react";
import { Droplet, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { totalWater, useDiaryStore } from "@/lib/store/diary-store";
import { parseNum, round1 } from "@/lib/utils";

const QUICK = [250, 500];

export function WaterCard() {
  const { t } = useI18n();
  const water = useDiaryStore((s) => s.water);
  const goals = useDiaryStore((s) => s.goals);
  const addWater = useDiaryStore((s) => s.addWater);
  const removeWater = useDiaryStore((s) => s.removeWater);

  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);

  const total = totalWater(water);

  async function add(amount: number) {
    if (amount <= 0 || busy) return;
    setBusy(true);
    try {
      await addWater(amount);
    } finally {
      setBusy(false);
    }
  }

  async function addCustom() {
    const amount = Math.round(parseNum(custom));
    if (amount <= 0) return;
    await add(amount);
    setCustom("");
  }

  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplet size={18} style={{ color: "var(--color-water)" }} />
          <h2 className="text-[16px] font-bold">{t("waterIntake")}</h2>
        </div>
        <span className="text-[13px] font-semibold tabular-nums text-ink-soft">
          {round1(total)}
          <span className="text-ink-soft/60">
            /{round1(goals.waterMl)} {t("ml")}
          </span>
        </span>
      </header>

      {/* Quick-add buttons */}
      <div className="mt-3 flex gap-2">
        {QUICK.map((amt) => (
          <button
            key={amt}
            onClick={() => add(amt)}
            disabled={busy}
            className="flex min-h-[44px] flex-1 select-none items-center justify-center gap-1 rounded-xl bg-[var(--color-water)]/12 text-[14px] font-semibold text-[var(--color-water)] transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <Plus size={16} />
            {amt} {t("ml")}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="mt-2 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder={t("customAmount")}
            className="min-h-[44px] w-full rounded-xl border border-line bg-surface pl-3.5 pr-10 text-[15px] outline-none placeholder:text-ink-soft/60 focus:border-[var(--color-water)]"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-medium text-ink-soft">
            {t("ml")}
          </span>
        </div>
        <button
          onClick={addCustom}
          disabled={busy || parseNum(custom) <= 0}
          className="flex min-h-[44px] select-none items-center justify-center rounded-xl bg-[var(--color-water)] px-4 text-[14px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {t("add")}
        </button>
      </div>

      {/* Entry list */}
      {water.length > 0 ? (
        <ul className="mt-3 divide-y divide-line">
          {water.map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between py-2 text-[14px]"
            >
              <span className="text-ink-soft">
                {w.loggedTime ?? "—"}
              </span>
              <span className="flex items-center gap-3">
                <span className="font-semibold tabular-nums">
                  {round1(w.amountMl)} {t("ml")}
                </span>
                <button
                  aria-label={t("delete")}
                  onClick={() => removeWater(w.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft active:bg-danger/10 active:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[13px] text-ink-soft">{t("noWaterYet")}</p>
      )}
    </section>
  );
}
