"use client";

import BrandHeader from "@/components/BrandHeader";
import { DEFAULT_GOALS } from "@/lib/types";

const goals = [
  { label: "Calories", value: DEFAULT_GOALS.calories, unit: "kcal", color: "var(--terracotta)" },
  { label: "Protein", value: DEFAULT_GOALS.protein, unit: "g", color: "var(--sage)" },
  { label: "Carbs", value: DEFAULT_GOALS.carbs, unit: "g", color: "var(--mustard)" },
  { label: "Fat", value: DEFAULT_GOALS.fat, unit: "g", color: "var(--mauve)" },
  { label: "Fiber", value: DEFAULT_GOALS.fiber, unit: "g", color: "var(--ink-soft)" },
];

export default function SettingsPage() {
  return (
    <div className="px-4 pt-2">
      <BrandHeader />

      <div className="text-center pt-3 pb-5">
        <h1 className="font-serif text-3xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-ink-soft mt-1">Your daily targets</p>
      </div>

      <div className="bg-card rounded-3xl shadow-sm border border-[color:var(--border)] divide-y divide-[color:var(--border)]">
        {goals.map((g) => (
          <div key={g.label} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
              <span className="text-ink font-medium">{g.label}</span>
            </div>
            <span className="font-serif text-lg font-semibold text-ink">
              {g.value}
              <span className="text-ink-mute text-sm font-sans font-normal ml-1">{g.unit}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-mute text-center mt-5 px-6">
        Goals are currently fixed defaults. Editable goals coming soon.
      </p>

      <div className="mt-8 bg-card rounded-3xl shadow-sm border border-[color:var(--border)] px-5 py-4">
        <h3 className="font-serif text-lg font-semibold text-ink mb-1">About Fit Anastasia</h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          Snap a photo of any meal — Claude estimates calories and macros, then helps you spot patterns over time.
        </p>
      </div>
    </div>
  );
}
