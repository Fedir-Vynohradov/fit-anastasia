"use client";

import { DailyTotals, DailyGoals } from "@/lib/types";

const RADIUS = 38;
const STROKE = 5;
const SIZE = (RADIUS + STROKE) * 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RingProps {
  value: number;
  goal: number;
  color: string;
  label: string;
  unit: string;
}

function MacroRing({ value, goal, color, label, unit }: RingProps) {
  const pct = Math.min(value / Math.max(goal, 1), 1);
  const offset = CIRCUMFERENCE * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <div className="relative">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none" stroke="#e6d8be" strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-2xl leading-none font-semibold text-ink">
            {Math.round(value)}
          </span>
          <span className="text-[10px] text-ink-mute mt-0.5 leading-none">
            /{goal}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-0">
        <span className="text-[10px] tracking-wider uppercase text-ink-soft font-medium">
          {label}
        </span>
        {unit && (
          <span className="text-[9px] tracking-wider uppercase text-ink-mute">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

interface MacroRingsProps {
  totals: DailyTotals;
  goals: DailyGoals;
}

export default function MacroRings({ totals, goals }: MacroRingsProps) {
  return (
    <div className="flex items-stretch gap-1 px-1">
      <MacroRing
        value={totals.calories} goal={goals.calories}
        color="var(--terracotta)" label="Calories" unit="kcal"
      />
      <MacroRing
        value={totals.protein} goal={goals.protein}
        color="var(--sage)" label="Protein" unit="g"
      />
      <MacroRing
        value={totals.carbs} goal={goals.carbs}
        color="var(--mustard)" label="Carbs" unit="g"
      />
      <MacroRing
        value={totals.fat} goal={goals.fat}
        color="var(--mauve)" label="Fat" unit="g"
      />
    </div>
  );
}
