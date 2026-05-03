import { NextRequest, NextResponse } from "next/server";
import { getMealsForDate, createMeal, getDailyTotalsForDate } from "@/lib/db-queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  try {
    const [meals, totals] = await Promise.all([
      getMealsForDate(date),
      getDailyTotalsForDate(date),
    ]);
    return NextResponse.json({ meals, totals });
  } catch (error) {
    console.error("GET /api/meals error:", error);
    return NextResponse.json({ error: "Failed to fetch meals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_data, food_name, description, calories, protein, carbs, fat, fiber, confidence } = body;

    if (!food_name) {
      return NextResponse.json({ error: "food_name is required" }, { status: 400 });
    }

    const validConfidence = ["high", "medium", "low"].includes(confidence) ? confidence : null;

    const date = new Date().toISOString().split("T")[0];
    const meal = await createMeal({
      date,
      image_data: image_data ?? null,
      food_name,
      description: description ?? "",
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      confidence: validConfidence,
    });

    return NextResponse.json({ success: true, meal });
  } catch (error) {
    console.error("POST /api/meals error:", error);
    return NextResponse.json({ error: "Failed to save meal" }, { status: 500 });
  }
}
