import type {
  BodyWeight,
  DailyGoals,
  Food,
  MealEntry,
  MealType,
} from "@/lib/domain/types";

/** Row shapes as returned by Supabase (snake_case). */
type GoalsRow = {
  target_calories: number;
  target_carbs_g: number | string;
  target_fat_g: number | string;
  target_protein_g: number | string;
};

type FoodRow = {
  id: string;
  name: string;
  serving: string | null;
  calories: number | string;
  carbs_g: number | string;
  fat_g: number | string;
  protein_g: number | string;
};

type MealEntryRow = {
  id: string;
  food_id: string | null;
  entry_date: string;
  meal_type: MealType;
  name: string;
  serving: string | null;
  calories: number | string;
  carbs_g: number | string;
  fat_g: number | string;
  protein_g: number | string;
  logged_time: string | null;
};

type WeightRow = {
  id: string;
  entry_date: string;
  weight_kg: number | string;
};

const num = (v: number | string): number =>
  typeof v === "number" ? v : parseFloat(v) || 0;

export function mapGoals(row: GoalsRow): DailyGoals {
  return {
    calories: num(row.target_calories),
    carbs_g: num(row.target_carbs_g),
    fat_g: num(row.target_fat_g),
    protein_g: num(row.target_protein_g),
  };
}

export function mapFood(row: FoodRow): Food {
  return {
    id: row.id,
    name: row.name,
    serving: row.serving,
    calories: num(row.calories),
    carbs_g: num(row.carbs_g),
    fat_g: num(row.fat_g),
    protein_g: num(row.protein_g),
  };
}

export function mapEntry(row: MealEntryRow): MealEntry {
  return {
    id: row.id,
    foodId: row.food_id,
    entryDate: row.entry_date,
    mealType: row.meal_type,
    name: row.name,
    serving: row.serving,
    calories: num(row.calories),
    carbs_g: num(row.carbs_g),
    fat_g: num(row.fat_g),
    protein_g: num(row.protein_g),
    loggedTime: row.logged_time ? row.logged_time.slice(0, 5) : null,
  };
}

export function mapWeight(row: WeightRow): BodyWeight {
  return {
    id: row.id,
    entryDate: row.entry_date,
    weightKg: num(row.weight_kg),
  };
}
