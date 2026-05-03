"use client";

import { useState, useEffect, useCallback } from "react";
import BrandHeader from "@/components/BrandHeader";
import DateNav from "@/components/DateNav";
import MealCard from "@/components/MealCard";
import MacroRings from "@/components/MacroRings";
import { Meal, DailyTotals, EMPTY_TOTALS, DEFAULT_GOALS } from "@/lib/types";

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HistoryPage() {
  const todayStr = todayLocal();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totals, setTotals] = useState<DailyTotals>(EMPTY_TOTALS);
  const [loading, setLoading] = useState(false);

  const fetchDate = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meals?date=${date}`);
      const data = await res.json();
      setMeals(data.meals ?? []);
      setTotals(data.totals ?? EMPTY_TOTALS);
    } catch {
      setMeals([]);
      setTotals(EMPTY_TOTALS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDate(selectedDate);
  }, [selectedDate, fetchDate]);

  const handleDelete = async (id: number) => {
    await fetch(`/api/meals/${id}`, { method: "DELETE" });
    fetchDate(selectedDate);
  };

  return (
    <div className="px-4 pt-2">
      <BrandHeader />
      <DateNav date={selectedDate} onChange={setSelectedDate} todayStr={todayStr} />

      <div className="bg-card rounded-3xl shadow-sm border border-[color:var(--border)] px-3 py-5 mt-3 mb-5">
        <MacroRings totals={totals} goals={DEFAULT_GOALS} />
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-[3px] border-terracotta border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && meals.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="font-serif text-xl font-bold text-ink">Meals</h2>
            <span className="text-xs text-ink-mute">{meals.length} logged</span>
          </div>
          <div className="flex flex-col gap-3">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {!loading && meals.length === 0 && (
        <div className="text-center text-ink-mute py-12">
          <p className="text-sm">No meals logged on this day</p>
        </div>
      )}
    </div>
  );
}
