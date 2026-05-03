export type Confidence = "high" | "medium" | "low";

export interface Meal {
  id: number;
  timestamp: string;
  date: string;
  image_data: string | null;
  food_name: string;
  description: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: Confidence | null;
  created_at: string;
}

export interface NutritionEstimate {
  food_name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: "high" | "medium" | "low";
  notes: string;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  meal_count: number;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  fiber: 25,
};

export const EMPTY_TOTALS: DailyTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  meal_count: 0,
};
