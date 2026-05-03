"use client";

import Image from "next/image";
import { Meal, Confidence } from "@/lib/types";

interface MealCardProps {
  meal: Meal;
  onDelete: (id: number) => void;
}

const confidenceStyle: Record<Confidence, string> = {
  high: "bg-sage/20 text-[color:var(--sage)]",
  medium: "bg-terracotta-soft/40 text-[color:var(--terracotta)]",
  low: "bg-mauve/20 text-[color:var(--mauve)]",
};

export default function MealCard({ meal, onDelete }: MealCardProps) {
  const time = new Date(meal.timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const conf = meal.confidence as Confidence | null;

  return (
    <div className="flex gap-3 bg-card rounded-2xl p-3 border border-[color:var(--border)] shadow-sm">
      {meal.image_data ? (
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={meal.image_data}
            alt={meal.food_name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-xl bg-bg flex items-center justify-center flex-shrink-0">
          <svg className="w-8 h-8 text-ink-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className="font-serif font-semibold text-ink text-lg leading-tight truncate flex-1">
            {meal.food_name}
          </h3>
          {conf && (
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md flex-shrink-0 ${confidenceStyle[conf]}`}
            >
              {conf}
            </span>
          )}
          <button
            onClick={() => onDelete(meal.id)}
            className="text-ink-mute hover:text-terracotta transition-colors flex-shrink-0 -mt-0.5"
            aria-label="Delete meal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-ink-mute mt-0.5">{time}</p>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 items-baseline">
          <span className="text-terracotta font-semibold text-sm">
            {Math.round(meal.calories)} kcal
          </span>
          <span className="text-ink-soft text-xs">
            P <span className="text-ink font-medium">{Math.round(meal.protein)}</span>
          </span>
          <span className="text-ink-soft text-xs">
            C <span className="text-ink font-medium">{Math.round(meal.carbs)}</span>
          </span>
          <span className="text-ink-soft text-xs">
            F <span className="text-ink font-medium">{Math.round(meal.fat)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
