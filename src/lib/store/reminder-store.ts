"use client";

import { create } from "zustand";
import * as repo from "@/lib/supabase/repo";
import { todayISO } from "@/lib/utils";

interface ReminderState {
  /** Whether today's body weight has been logged. null = not checked yet. */
  weightLoggedToday: boolean | null;
  checkedDate: string | null;
  /** Refresh the flag for today (skips refetch if already checked today). */
  refresh: (force?: boolean) => Promise<void>;
  /** Mark today's weight as logged without a round-trip. */
  markLogged: () => void;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  weightLoggedToday: null,
  checkedDate: null,

  async refresh(force = false) {
    const today = todayISO();
    if (!force && get().checkedDate === today && get().weightLoggedToday !== null) {
      return;
    }
    try {
      const w = await repo.fetchWeight(today);
      set({ weightLoggedToday: w !== null, checkedDate: today });
    } catch {
      // Non-fatal: leave the flag as-is so we don't nag on transient errors.
    }
  },

  markLogged() {
    set({ weightLoggedToday: true, checkedDate: todayISO() });
  },
}));
