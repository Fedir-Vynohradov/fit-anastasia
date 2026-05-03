import { NextRequest, NextResponse } from "next/server";
import { deleteMeal } from "@/lib/db-queries";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mealId = parseInt(id, 10);
    if (isNaN(mealId)) {
      return NextResponse.json({ error: "Invalid meal id" }, { status: 400 });
    }
    deleteMeal(mealId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/meals/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete meal" }, { status: 500 });
  }
}
