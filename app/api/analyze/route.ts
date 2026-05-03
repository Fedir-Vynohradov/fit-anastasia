import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { NutritionEstimate } from "@/lib/types";
import { getApiKey } from "@/lib/env";

const ANALYSIS_PROMPT = `Analyze this food image and provide nutritional estimates.

Respond with ONLY a valid JSON object in this exact format (no markdown, no code fences, just raw JSON):
{
  "food_name": "Brief name of the food",
  "description": "One sentence describing what you see",
  "calories": 0,
  "protein": 0.0,
  "carbs": 0.0,
  "fat": 0.0,
  "fiber": 0.0,
  "confidence": "high",
  "notes": "Any important caveats about your estimate"
}

Rules:
- Estimate based on typical serving sizes visible in the image
- If multiple items are visible, sum all nutritional values
- Use whole numbers for calories, one decimal place for macros
- confidence must be exactly "high", "medium", or "low"
- high = clearly identifiable food with well-known nutrition
- medium = identifiable but portion size uncertain
- low = unclear food, unusual preparation, or can't identify
- If no food is visible, return 0 values and explain in notes
- Do NOT include any text outside the JSON object`;

export async function POST(request: NextRequest) {
  const client = new Anthropic({ apiKey: getApiKey() });
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");
    const mediaTypeMatch = image.match(/^data:(image\/[a-z]+);base64,/);
    const mediaType = (mediaTypeMatch?.[1] ?? "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/gif"
      | "image/webp";

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64Data },
            },
            { type: "text", text: ANALYSIS_PROMPT },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const estimate: NutritionEstimate = JSON.parse(textBlock.text.trim());
    return NextResponse.json({ success: true, estimate });
  } catch (error) {
    console.error("Analysis error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse nutrition data — please try again" },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
