"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n/provider";
import { useDiaryStore } from "@/lib/store/diary-store";
import { parseNum } from "@/lib/utils";
import type { EntryInput } from "@/lib/supabase/repo";
import type { Food, MealEntry, MealType } from "@/lib/domain/types";

type Tab = "library" | "quick";

export interface AddFoodTarget {
  mealType: MealType;
  /** When set, the sheet edits this existing entry instead of adding. */
  entry?: MealEntry;
}

interface Props {
  open: boolean;
  target: AddFoodTarget | null;
  date: string;
  onClose: () => void;
}

const num = (v: string) => Math.max(0, parseNum(v));

const MEAL_LABEL: Record<MealType, "breakfast" | "lunch" | "snack" | "dinner"> =
  { breakfast: "breakfast", lunch: "lunch", snack: "snack", dinner: "dinner" };

export function AddFoodSheet({ open, target, date, onClose }: Props) {
  const { t } = useI18n();
  const foods = useDiaryStore((s) => s.foods);
  const addEntry = useDiaryStore((s) => s.addEntry);
  const editEntry = useDiaryStore((s) => s.editEntry);
  const removeEntry = useDiaryStore((s) => s.removeEntry);
  const removeFood = useDiaryStore((s) => s.removeFood);

  const editing = target?.entry;
  const [tab, setTab] = useState<Tab>("quick");
  const [query, setQuery] = useState("");

  // Quick-add / edit form state
  const [name, setName] = useState("");
  const [serving, setServing] = useState("");
  const [calories, setCalories] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [protein, setProtein] = useState("");
  const [time, setTime] = useState("");
  const [saveLib, setSaveLib] = useState(false);
  const [busy, setBusy] = useState(false);

  // Reset the form whenever the sheet opens for a new target.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setBusy(false);
    if (editing) {
      setTab("quick");
      setName(editing.name);
      setServing(editing.serving ?? "");
      setCalories(String(editing.calories));
      setCarbs(String(editing.carbs_g));
      setFat(String(editing.fat_g));
      setProtein(String(editing.protein_g));
      setTime(editing.loggedTime ?? "");
      setSaveLib(false);
    } else {
      setTab(foods.length > 0 ? "library" : "quick");
      setName("");
      setServing("");
      setCalories("");
      setCarbs("");
      setFat("");
      setProtein("");
      setTime("");
      setSaveLib(false);
    }
  }, [open, editing, foods.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter((f) => f.name.toLowerCase().includes(q));
  }, [foods, query]);

  if (!target) return null;

  const buildInput = (): EntryInput => ({
    entryDate: date,
    mealType: target.mealType,
    name: name.trim(),
    serving: serving.trim() || null,
    nutrients: {
      calories: num(calories),
      carbs_g: num(carbs),
      fat_g: num(fat),
      protein_g: num(protein),
    },
    loggedTime: time || null,
  });

  async function handleAddFromLibrary(food: Food) {
    setBusy(true);
    try {
      await addEntry(
        {
          entryDate: date,
          mealType: target!.mealType,
          name: food.name,
          serving: food.serving,
          nutrients: {
            calories: food.calories,
            carbs_g: food.carbs_g,
            fat_g: food.fat_g,
            protein_g: food.protein_g,
          },
          loggedTime: null,
          foodId: food.id,
        },
        false,
      );
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      if (editing) {
        await editEntry(editing.id, buildInput());
      } else {
        await addEntry(buildInput(), saveLib);
      }
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteEntry() {
    if (!editing) return;
    setBusy(true);
    try {
      await removeEntry(editing.id);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  const sheetTitle = editing
    ? t("editEntry")
    : `${t("addTo")} ${t(MEAL_LABEL[target.mealType])}`;

  return (
    <BottomSheet open={open} onOpenChange={(o) => !o && onClose()} title={sheetTitle}>
      {!editing && (
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-line/60 p-1">
          <button
            onClick={() => setTab("library")}
            className={`min-h-[40px] select-none rounded-lg text-[14px] font-semibold transition-colors ${
              tab === "library" ? "bg-surface text-ink shadow-sm" : "text-ink-soft"
            }`}
          >
            {t("fromLibrary")}
          </button>
          <button
            onClick={() => setTab("quick")}
            className={`min-h-[40px] select-none rounded-lg text-[14px] font-semibold transition-colors ${
              tab === "quick" ? "bg-surface text-ink shadow-sm" : "text-ink-soft"
            }`}
          >
            {t("quickAdd")}
          </button>
        </div>
      )}

      {!editing && tab === "library" ? (
        <div className="space-y-3">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchLibrary")}
              className="min-h-[48px] w-full rounded-xl border border-line bg-surface pl-11 pr-3.5 text-[16px] outline-none focus:border-lime"
            />
          </div>

          {foods.length === 0 ? (
            <p className="py-6 text-center text-[14px] text-ink-soft">
              {t("emptyLibrary")}
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-[14px] text-ink-soft">
              {t("noMatches")}
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {filtered.map((f) => (
                <li key={f.id} className="flex items-center gap-2 py-1">
                  <button
                    disabled={busy}
                    onClick={() => handleAddFromLibrary(f)}
                    className="flex min-h-[48px] flex-1 select-none items-center justify-between text-left active:opacity-70"
                  >
                    <span className="min-w-0 flex-1 pr-3">
                      <span className="block truncate text-[15px] font-medium">
                        {f.name}
                      </span>
                      {f.serving && (
                        <span className="block truncate text-[12px] text-ink-soft">
                          {f.serving}
                        </span>
                      )}
                    </span>
                    <span className="text-[14px] font-semibold tabular-nums">
                      {f.calories} {t("kcal")}
                    </span>
                  </button>
                  <button
                    aria-label={t("delete")}
                    disabled={busy}
                    onClick={() => removeFood(f.id)}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-ink-soft active:bg-danger/10 active:text-danger"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          <Field
            label={t("foodName")}
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus={!editing}
            placeholder=""
          />
          <Field
            label={t("servingLabel")}
            name="serving"
            value={serving}
            onChange={(e) => setServing(e.target.value)}
            placeholder={t("servingPlaceholder")}
          />
          <Field
            label={t("calories")}
            name="calories"
            type="number"
            inputMode="decimal"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            suffix={t("kcal")}
          />
          <div className="grid grid-cols-3 gap-3">
            <Field
              label={t("carbs")}
              name="carbs"
              type="number"
              inputMode="decimal"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              suffix={t("grams")}
            />
            <Field
              label={t("fat")}
              name="fat"
              type="number"
              inputMode="decimal"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              suffix={t("grams")}
            />
            <Field
              label={t("protein")}
              name="protein"
              type="number"
              inputMode="decimal"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              suffix={t("grams")}
            />
          </div>
          <Field
            label={t("time")}
            name="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          {!editing && (
            <label className="flex select-none items-center gap-2.5 py-1">
              <input
                type="checkbox"
                checked={saveLib}
                onChange={(e) => setSaveLib(e.target.checked)}
                className="h-5 w-5 accent-[var(--color-lime)]"
              />
              <span className="text-[14px] text-ink-soft">
                {t("saveToLibrary")}
              </span>
            </label>
          )}

          <div className="flex gap-3 pt-1">
            {editing && (
              <Button variant="danger" onClick={handleDeleteEntry} disabled={busy}>
                <Trash2 size={18} />
                {t("delete")}
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={busy || !name.trim()}
              fullWidth
            >
              {busy ? t("saving") : editing ? t("save") : t("add")}
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
