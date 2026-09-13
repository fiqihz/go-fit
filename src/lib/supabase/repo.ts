"use client";

import { getSupabase } from "@/lib/supabase/client";
import {
  mapEntry,
  mapFood,
  mapGoals,
  mapWater,
  mapWeight,
} from "@/lib/supabase/mappers";
import type {
  BodyWeight,
  DailyGoals,
  Food,
  MealEntry,
  MealType,
  Nutrients,
  WaterEntry,
} from "@/lib/domain/types";

async function requireUserId(): Promise<string> {
  const { data } = await getSupabase().auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error("Not signed in.");
  return id;
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------
export async function fetchGoals(): Promise<DailyGoals> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("daily_goals")
    .select(
      "target_calories,target_carbs_g,target_fat_g,target_protein_g,target_water_ml",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    // Fallback if the signup trigger has not run yet.
    return { calories: 2000, carbs_g: 250, fat_g: 65, protein_g: 150, waterMl: 2500 };
  }
  return mapGoals(data);
}

export async function saveGoals(
  goals: DailyGoals,
  opts: { onboarded?: boolean } = {},
): Promise<void> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const payload: Record<string, unknown> = {
    user_id: userId,
    target_calories: Math.round(goals.calories),
    target_carbs_g: goals.carbs_g,
    target_fat_g: goals.fat_g,
    target_protein_g: goals.protein_g,
    target_water_ml: Math.round(goals.waterMl),
    updated_at: new Date().toISOString(),
  };
  if (opts.onboarded !== undefined) payload.onboarded = opts.onboarded;
  const { error } = await sb.from("daily_goals").upsert(payload);
  if (error) throw error;
}

/** Whether the user has completed the onboarding target setup. */
export async function fetchOnboarded(): Promise<boolean> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("daily_goals")
    .select("onboarded")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.onboarded);
}

// ---------------------------------------------------------------------------
// Foods (library)
// ---------------------------------------------------------------------------
export async function fetchFoods(): Promise<Food[]> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("foods")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapFood);
}

export async function createFood(input: {
  name: string;
  serving: string | null;
  nutrients: Nutrients;
}): Promise<Food> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("foods")
    .insert({
      user_id: userId,
      name: input.name,
      serving: input.serving,
      calories: input.nutrients.calories,
      carbs_g: input.nutrients.carbs_g,
      fat_g: input.nutrients.fat_g,
      protein_g: input.nutrients.protein_g,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapFood(data);
}

export async function deleteFood(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("foods").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Meal entries
// ---------------------------------------------------------------------------
export async function fetchEntries(date: string): Promise<MealEntry[]> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("meal_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", date)
    .order("logged_time", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapEntry);
}

export async function fetchEntriesRange(
  start: string,
  end: string,
): Promise<MealEntry[]> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("meal_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("entry_date", start)
    .lte("entry_date", end)
    .order("entry_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapEntry);
}

export interface EntryInput {
  entryDate: string;
  mealType: MealType;
  name: string;
  serving: string | null;
  nutrients: Nutrients;
  loggedTime: string | null;
  foodId?: string | null;
}

export async function createEntry(input: EntryInput): Promise<MealEntry> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("meal_entries")
    .insert({
      user_id: userId,
      food_id: input.foodId ?? null,
      entry_date: input.entryDate,
      meal_type: input.mealType,
      name: input.name,
      serving: input.serving,
      calories: input.nutrients.calories,
      carbs_g: input.nutrients.carbs_g,
      fat_g: input.nutrients.fat_g,
      protein_g: input.nutrients.protein_g,
      logged_time: input.loggedTime,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapEntry(data);
}

export async function updateEntry(
  id: string,
  input: EntryInput,
): Promise<MealEntry> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("meal_entries")
    .update({
      meal_type: input.mealType,
      name: input.name,
      serving: input.serving,
      calories: input.nutrients.calories,
      carbs_g: input.nutrients.carbs_g,
      fat_g: input.nutrients.fat_g,
      protein_g: input.nutrients.protein_g,
      logged_time: input.loggedTime,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapEntry(data);
}

export async function deleteEntry(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("meal_entries").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Body weight
// ---------------------------------------------------------------------------
export async function fetchWeight(date: string): Promise<BodyWeight | null> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("body_weights")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", date)
    .maybeSingle();
  if (error) throw error;
  return data ? mapWeight(data) : null;
}

export async function fetchWeightsRange(
  start: string,
  end: string,
): Promise<BodyWeight[]> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("body_weights")
    .select("*")
    .eq("user_id", userId)
    .gte("entry_date", start)
    .lte("entry_date", end)
    .order("entry_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapWeight);
}

export async function saveWeight(
  date: string,
  weightKg: number,
): Promise<BodyWeight> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("body_weights")
    .upsert(
      {
        user_id: userId,
        entry_date: date,
        weight_kg: weightKg,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,entry_date" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return mapWeight(data);
}

// ---------------------------------------------------------------------------
// Water entries (many per day)
// ---------------------------------------------------------------------------
export async function fetchWater(date: string): Promise<WaterEntry[]> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("water_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", date)
    .order("logged_time", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapWater);
}

export async function fetchWaterRange(
  start: string,
  end: string,
): Promise<WaterEntry[]> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("water_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("entry_date", start)
    .lte("entry_date", end)
    .order("entry_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapWater);
}

export async function createWater(input: {
  entryDate: string;
  amountMl: number;
  loggedTime: string | null;
}): Promise<WaterEntry> {
  const sb = getSupabase();
  const userId = await requireUserId();
  const { data, error } = await sb
    .from("water_entries")
    .insert({
      user_id: userId,
      entry_date: input.entryDate,
      amount_ml: Math.round(input.amountMl),
      logged_time: input.loggedTime,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapWater(data);
}

export async function deleteWater(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("water_entries").delete().eq("id", id);
  if (error) throw error;
}
