import { getDb } from "./db";
import { Meal, DailyTotals } from "./types";

export function getMealsForDate(date: string): Meal[] {
  return getDb()
    .prepare("SELECT * FROM meals WHERE date = ? ORDER BY timestamp ASC")
    .all(date) as Meal[];
}

export function getMealsForDateRange(startDate: string, endDate: string): Meal[] {
  return getDb()
    .prepare(
      "SELECT id, date, food_name, description, calories, protein, carbs, fat, fiber, timestamp FROM meals WHERE date BETWEEN ? AND ? ORDER BY timestamp ASC"
    )
    .all(startDate, endDate) as Meal[];
}

export function getDailyTotalsForDate(date: string): DailyTotals {
  const row = getDb()
    .prepare(
      `SELECT
        COALESCE(ROUND(SUM(calories), 1), 0) as calories,
        COALESCE(ROUND(SUM(protein), 1), 0)  as protein,
        COALESCE(ROUND(SUM(carbs), 1), 0)    as carbs,
        COALESCE(ROUND(SUM(fat), 1), 0)      as fat,
        COALESCE(ROUND(SUM(fiber), 1), 0)    as fiber,
        COUNT(*) as meal_count
       FROM meals WHERE date = ?`
    )
    .get(date) as DailyTotals;
  return row;
}

export function getDailyTotalsForRange(startDate: string, endDate: string) {
  return getDb()
    .prepare(
      `SELECT
        date,
        ROUND(SUM(calories), 1) as calories,
        ROUND(SUM(protein), 1)  as protein,
        ROUND(SUM(carbs), 1)    as carbs,
        ROUND(SUM(fat), 1)      as fat,
        ROUND(SUM(fiber), 1)    as fiber,
        COUNT(*) as meal_count
       FROM meals
       WHERE date BETWEEN ? AND ?
       GROUP BY date
       ORDER BY date ASC`
    )
    .all(startDate, endDate);
}

export function createMeal(data: {
  date: string;
  image_data: string | null;
  food_name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: string | null;
}): Meal {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO meals (date, image_data, food_name, description, calories, protein, carbs, fat, fiber, confidence)
       VALUES (@date, @image_data, @food_name, @description, @calories, @protein, @carbs, @fat, @fiber, @confidence)`
    )
    .run(data);
  return db.prepare("SELECT * FROM meals WHERE id = ?").get(result.lastInsertRowid) as Meal;
}

export function deleteMeal(id: number): void {
  getDb().prepare("DELETE FROM meals WHERE id = ?").run(id);
}

export function getAvailableDates(): string[] {
  return (
    getDb()
      .prepare("SELECT DISTINCT date FROM meals ORDER BY date DESC")
      .all() as { date: string }[]
  ).map((r) => r.date);
}
