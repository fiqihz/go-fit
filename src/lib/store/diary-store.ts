"use client";

import { create } from "zustand";
import {
  sumNutrients,
  zeroNutrients,
  type DailyGoals,
  type Food,
  type MealEntry,
  type MealType,
  type Nutrients,
  type WaterEntry,
} from "@/lib/domain/types";
import * as repo from "@/lib/supabase/repo";
import type { EntryInput } from "@/lib/supabase/repo";
import { todayISO } from "@/lib/utils";

interface DiaryState {
  date: string;
  goals: DailyGoals;
  entries: MealEntry[];
  foods: Food[];
  water: WaterEntry[];
  loading: boolean;
  error: string | null;

  setDate: (date: string) => Promise<void>;
  loadAll: () => Promise<void>;
  reloadEntries: () => Promise<void>;
  loadFoods: () => Promise<void>;

  addEntry: (input: EntryInput, saveToLibrary: boolean) => Promise<void>;
  editEntry: (id: string, input: EntryInput) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;

  addWater: (amountMl: number) => Promise<void>;
  removeWater: (id: string) => Promise<void>;

  saveGoals: (
    goals: DailyGoals,
    opts?: { onboarded?: boolean },
  ) => Promise<void>;
  removeFood: (id: string) => Promise<void>;

  reset: () => void;
}

const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  carbs_g: 250,
  fat_g: 65,
  protein_g: 150,
  waterMl: 2500,
};

export const useDiaryStore = create<DiaryState>((set, get) => ({
  date: todayISO(),
  goals: DEFAULT_GOALS,
  entries: [],
  foods: [],
  water: [],
  loading: false,
  error: null,

  async setDate(date) {
    set({ date });
    await get().reloadEntries();
  },

  async loadAll() {
    set({ loading: true, error: null });
    try {
      const [goals, entries, foods, water] = await Promise.all([
        repo.fetchGoals(),
        repo.fetchEntries(get().date),
        repo.fetchFoods(),
        repo.fetchWater(get().date),
      ]);
      set({ goals, entries, foods, water, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  async reloadEntries() {
    set({ loading: true, error: null });
    try {
      const [entries, water] = await Promise.all([
        repo.fetchEntries(get().date),
        repo.fetchWater(get().date),
      ]);
      set({ entries, water, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  async loadFoods() {
    try {
      const foods = await repo.fetchFoods();
      set({ foods });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async addEntry(input, saveToLibrary) {
    const created = await repo.createEntry(input);
    set({ entries: [...get().entries, created] });
    if (saveToLibrary) {
      try {
        const food = await repo.createFood({
          name: input.name,
          serving: input.serving,
          nutrients: input.nutrients,
        });
        set({ foods: [...get().foods, food] });
      } catch {
        // Non-fatal: the entry is logged even if saving to library fails.
      }
    }
  },

  async editEntry(id, input) {
    const updated = await repo.updateEntry(id, input);
    set({
      entries: get().entries.map((e) => (e.id === id ? updated : e)),
    });
  },

  async removeEntry(id) {
    const prev = get().entries;
    set({ entries: prev.filter((e) => e.id !== id) }); // optimistic
    try {
      await repo.deleteEntry(id);
    } catch (e) {
      set({ entries: prev, error: (e as Error).message });
    }
  },

  async addWater(amountMl) {
    const now = new Date();
    const loggedTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
    const created = await repo.createWater({
      entryDate: get().date,
      amountMl,
      loggedTime,
    });
    set({ water: [...get().water, created] });
  },

  async removeWater(id) {
    const prev = get().water;
    set({ water: prev.filter((w) => w.id !== id) }); // optimistic
    try {
      await repo.deleteWater(id);
    } catch (e) {
      set({ water: prev, error: (e as Error).message });
    }
  },

  async saveGoals(goals, opts) {
    await repo.saveGoals(goals, opts);
    set({ goals });
  },

  async removeFood(id) {
    const prev = get().foods;
    set({ foods: prev.filter((f) => f.id !== id) });
    try {
      await repo.deleteFood(id);
    } catch (e) {
      set({ foods: prev, error: (e as Error).message });
    }
  },

  reset() {
    set({
      date: todayISO(),
      goals: DEFAULT_GOALS,
      entries: [],
      foods: [],
      water: [],
      loading: false,
      error: null,
    });
  },
}));

/** Total water consumed (ml) across the given entries. */
export function totalWater(water: WaterEntry[]): number {
  return water.reduce((s, w) => s + w.amountMl, 0);
}

// --- Selectors / helpers -----------------------------------------------------

/** Entries grouped by meal type. */
export function groupByMeal(entries: MealEntry[]): Record<MealType, MealEntry[]> {
  const groups: Record<MealType, MealEntry[]> = {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: [],
    additional: [],
  };
  for (const e of entries) groups[e.mealType].push(e);
  return groups;
}

/** Total nutrients consumed for the given entries. */
export function totalForEntries(entries: MealEntry[]): Nutrients {
  if (entries.length === 0) return zeroNutrients();
  return sumNutrients(entries);
}
