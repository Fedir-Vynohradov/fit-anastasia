import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getMealsForDateRange, getDailyTotalsForRange } from "@/lib/db-queries";
import { getApiKey } from "@/lib/env";

export async function POST(request: NextRequest) {
  const client = new Anthropic({ apiKey: getApiKey() });
  try {
    const body = await request.json();
    const days: number = body.days ?? 7;

    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - days * 86_400_000).toISOString().split("T")[0];

    const [meals, dailyTotals] = await Promise.all([
      getMealsForDateRange(startDate, endDate),
      getDailyTotalsForRange(startDate, endDate),
    ]);

    if (meals.length === 0) {
      return NextResponse.json({
        advice:
          "No meal data found for the past week. Start logging your meals to get personalized dietary advice!",
      });
    }

    const mealSummary = meals.map((m) => ({
      date: m.date,
      food: m.food_name,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      fiber: m.fiber,
    }));

    const prompt = `You are a knowledgeable and supportive nutritionist. Analyze the following ${days}-day food log and provide personalized, actionable dietary advice.

MEAL LOG (last ${days} days):
${JSON.stringify(mealSummary, null, 2)}

DAILY TOTALS BY DAY:
${JSON.stringify(dailyTotals, null, 2)}

DAILY GOALS:
- Calories: 2000 kcal
- Protein: 150g
- Carbs: 200g
- Fat: 65g
- Fiber: 25g

Please provide:
## Assessment
A brief 2-3 sentence overview of their current eating patterns.

## Recommendations
3-4 specific, actionable recommendations based on their actual food choices. Reference the foods they actually ate.

## What You're Doing Well
One or two positive observations about their diet.

## Watch Out For
Any nutritional gaps or excesses to address.

Be encouraging, specific, and practical. Keep total response under 400 words.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const advice = textBlock?.type === "text" ? textBlock.text : "Unable to generate advice.";

    return NextResponse.json({ success: true, advice });
  } catch (error) {
    console.error("POST /api/advice error:", error);
    return NextResponse.json({ error: "Failed to generate advice" }, { status: 500 });
  }
}
