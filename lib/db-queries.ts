import { getSql, ensureSchema } from "./db";
import { Meal, DailyTotals } from "./types";

export async function getMealsForDate(date: string): Promise<Meal[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM meals WHERE date = ${date} ORDER BY timestamp ASC
  `) as unknown as Meal[];
  return rows;
}

export async function getMealsForDateRange(
  startDate: string,
  endDate: string
): Promise<Meal[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, date, food_name, description, calories, protein, carbs, fat, fiber, timestamp, confidence
    FROM meals
    WHERE date BETWEEN ${startDate} AND ${endDate}
    ORDER BY timestamp ASC
  `) as unknown as Meal[];
  return rows;
}

export async function getDailyTotalsForDate(date: string): Promise<DailyTotals> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT
      COALESCE(ROUND(SUM(calories)::numeric, 1), 0)::float8 AS calories,
      COALESCE(ROUND(SUM(protein)::numeric,  1), 0)::float8 AS protein,
      COALESCE(ROUND(SUM(carbs)::numeric,    1), 0)::float8 AS carbs,
      COALESCE(ROUND(SUM(fat)::numeric,      1), 0)::float8 AS fat,
      COALESCE(ROUND(SUM(fiber)::numeric,    1), 0)::float8 AS fiber,
      COUNT(*)::int AS meal_count
    FROM meals WHERE date = ${date}
  `) as unknown as DailyTotals[];
  return rows[0];
}

export async function getDailyTotalsForRange(startDate: string, endDate: string) {
  await ensureSchema();
  const sql = getSql();
  return (await sql`
    SELECT
      date,
      ROUND(SUM(calories)::numeric, 1)::float8 AS calories,
      ROUND(SUM(protein)::numeric,  1)::float8 AS protein,
      ROUND(SUM(carbs)::numeric,    1)::float8 AS carbs,
      ROUND(SUM(fat)::numeric,      1)::float8 AS fat,
      ROUND(SUM(fiber)::numeric,    1)::float8 AS fiber,
      COUNT(*)::int AS meal_count
    FROM meals
    WHERE date BETWEEN ${startDate} AND ${endDate}
    GROUP BY date
    ORDER BY date ASC
  `) as unknown as Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    meal_count: number;
  }>;
}

export async function createMeal(data: {
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
}): Promise<Meal> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO meals (date, image_data, food_name, description, calories, protein, carbs, fat, fiber, confidence)
    VALUES (${data.date}, ${data.image_data}, ${data.food_name}, ${data.description},
            ${data.calories}, ${data.protein}, ${data.carbs}, ${data.fat}, ${data.fiber},
            ${data.confidence})
    RETURNING *
  `) as unknown as Meal[];
  return rows[0];
}

export async function deleteMeal(id: number): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`DELETE FROM meals WHERE id = ${id}`;
}

export async function getAvailableDates(): Promise<string[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT DISTINCT date FROM meals ORDER BY date DESC
  `) as unknown as { date: string }[];
  return rows.map((r) => r.date);
}
