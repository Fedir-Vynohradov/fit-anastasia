"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import BrandHeader from "@/components/BrandHeader";
import DateNav from "@/components/DateNav";
import CameraCapture from "@/components/CameraCapture";
import MacroRings from "@/components/MacroRings";
import MealCard from "@/components/MealCard";
import { Meal, DailyTotals, EMPTY_TOTALS, DEFAULT_GOALS } from "@/lib/types";

type UIState = "idle" | "preview" | "analyzing";

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HomePage() {
  const [uiState, setUiState] = useState<UIState>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totals, setTotals] = useState<DailyTotals>(EMPTY_TOTALS);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState(todayLocal());

  const fetchDay = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/meals?date=${date}`);
      const data = await res.json();
      setMeals(data.meals ?? []);
      setTotals(data.totals ?? EMPTY_TOTALS);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchDay(today);
  }, [today, fetchDay]);

  const handleCapture = (base64: string) => {
    setCapturedImage(base64);
    setUiState("preview");
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;
    setUiState("analyzing");
    setError(null);

    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage }),
      });

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json();
        throw new Error(errData.error ?? "Analysis failed");
      }

      const { estimate } = await analyzeRes.json();

      const saveRes = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...estimate, image_data: capturedImage }),
      });

      if (!saveRes.ok) throw new Error("Failed to save meal");

      await fetchDay(today);
      setCapturedImage(null);
      setUiState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setUiState("preview");
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setUiState("idle");
    setError(null);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/meals/${id}`, { method: "DELETE" });
    await fetchDay(today);
  };

  return (
    <div className="px-4 pt-2">
      <BrandHeader />
      <DateNav date={today} onChange={setToday} todayStr={todayLocal()} />

      {/* Macro card */}
      <div className="bg-card rounded-3xl shadow-sm border border-[color:var(--border)] px-3 py-5 mt-3 mb-5">
        <MacroRings totals={totals} goals={DEFAULT_GOALS} />
      </div>

      {/* Capture / preview / analyzing */}
      {uiState === "idle" && (
        <CameraCapture onCapture={handleCapture} />
      )}

      {uiState === "preview" && capturedImage && (
        <div className="flex flex-col gap-3">
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-card border border-[color:var(--border)]">
            <Image src={capturedImage} alt="Food preview" fill className="object-cover" unoptimized />
          </div>
          {error && (
            <div className="bg-terracotta-soft/30 border border-[color:var(--terracotta)]/30 text-[color:var(--terracotta)] text-sm rounded-2xl px-4 py-3">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleRetake}
              className="flex-1 py-3.5 rounded-2xl border border-[color:var(--border-strong)] text-ink-soft font-semibold touch-manipulation"
            >
              Retake
            </button>
            <button
              onClick={handleAnalyze}
              className="flex-1 py-3.5 rounded-2xl bg-terracotta text-white font-semibold shadow-sm hover:opacity-90 touch-manipulation"
            >
              Analyze
            </button>
          </div>
        </div>
      )}

      {uiState === "analyzing" && (
        <div className="flex flex-col items-center gap-4 py-10">
          {capturedImage && (
            <div className="relative w-32 h-32 rounded-3xl overflow-hidden opacity-70 border border-[color:var(--border)]">
              <Image src={capturedImage} alt="Analyzing" fill className="object-cover" unoptimized />
            </div>
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 border-[3px] border-terracotta border-t-transparent rounded-full animate-spin" />
            <p className="text-ink-soft text-sm font-medium">Analyzing your food…</p>
          </div>
        </div>
      )}

      {/* Meals list */}
      {meals.length > 0 && uiState === "idle" && (
        <div className="mt-7">
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="font-serif text-xl font-bold text-ink">
              {today === todayLocal() ? "Today's meals" : "Meals"}
            </h2>
            <span className="text-xs text-ink-mute">
              {meals.length} logged
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {meals.length === 0 && uiState === "idle" && (
        <div className="mt-8 text-center text-ink-mute">
          <p className="text-sm">No meals logged yet</p>
          <p className="text-xs mt-1">Snap a photo to get started</p>
        </div>
      )}
    </div>
  );
}
