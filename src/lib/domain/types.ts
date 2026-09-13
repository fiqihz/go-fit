/** Core domain types for go-fit. */

export const MEAL_TYPES = [
  "breakfast",
  "lunch",
  "snack",
  "dinner",
  "additional",
] as const;
export type MealType = (typeof MEAL_TYPES)[number];

/** The four nutrition metrics tracked across the app. */
export interface Nutrients {
  calories: number;
  carbs_g: number;
  fat_g: number;
  protein_g: number;
}

export interface DailyGoals extends Nutrients {
  /** Daily water target in milliliters. */
  waterMl: number;
}

export interface Food extends Nutrients {
  id: string;
  name: string;
  serving: string | null;
}

export interface MealEntry extends Nutrients {
  id: string;
  foodId: string | null;
  entryDate: string; // YYYY-MM-DD
  mealType: MealType;
  name: string;
  serving: string | null;
  loggedTime: string | null; // HH:MM
}

export interface BodyWeight {
  id: string;
  entryDate: string; // YYYY-MM-DD
  weightKg: number;
}

export interface WaterEntry {
  id: string;
  entryDate: string; // YYYY-MM-DD
  amountMl: number;
  loggedTime: string | null; // HH:MM
}

/** Empty nutrient accumulator. */
export function zeroNutrients(): Nutrients {
  return { calories: 0, carbs_g: 0, fat_g: 0, protein_g: 0 };
}

/** Sum nutrients across a list of items. */
export function sumNutrients(items: Nutrients[]): Nutrients {
  return items.reduce<Nutrients>((acc, n) => {
    acc.calories += n.calories;
    acc.carbs_g += n.carbs_g;
    acc.fat_g += n.fat_g;
    acc.protein_g += n.protein_g;
    return acc;
  }, zeroNutrients());
}
